import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ManagerInventoryPage from '@/app/manager/inventory/page'
import { useInventoryItems } from '@/hooks/useInventory'
import { Timestamp } from 'firebase/firestore'
import type { InventoryItem } from '@/types/inventory'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the hooks and components used in the page
vi.mock('@/hooks/useInventory')
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 'test-user', role: 'manager' },
      role: 'manager',
    }
    return selector(state)
  }),
}))
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

vi.mock('@/lib/utils/formatters', () => ({
  formatCurrency: vi.fn((value) => `$${value.toFixed(2)}`),
}))

vi.mock('@/components/features/common/Navigation', () => ({
  Navigation: () => <div data-testid="navigation-mock" />,
}))
vi.mock('@/components/features/inventory/StockAdjustmentDialog', () => ({
  StockAdjustmentDialog: () => (
    <div data-testid="stock-adjustment-dialog-mock" />
  ),
}))
vi.mock('@/lib/firebase/config', () => ({
  db: {},
  auth: {},
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const renderWithClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  )
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Item 1',
    brand: 'A',
    category: 'C1',
    sku: 'S1',
    stock: 10,
    price: 100,
    costPrice: 50,
    reorderPoint: 5,
    unitOfMeasure: 'pc',
    createdAt: Timestamp.now(),
    lastUpdated: Timestamp.now(),
  },
  {
    id: '2',
    name: 'Item 2',
    brand: 'B',
    category: 'C2',
    sku: 'S2',
    stock: 4,
    price: 200,
    costPrice: 120,
    reorderPoint: 5,
    unitOfMeasure: 'pc',
    createdAt: Timestamp.now(),
    lastUpdated: Timestamp.now(),
  },
  {
    id: '3',
    name: 'Item 3',
    brand: 'A',
    category: 'C1',
    sku: 'S3',
    stock: 0,
    price: 50,
    costPrice: 20,
    reorderPoint: 2,
    unitOfMeasure: 'pc',
    createdAt: Timestamp.now(),
    lastUpdated: Timestamp.now(),
  },
]

describe('ManagerInventoryPage', () => {
  it('calculates and displays inventory KPIs correctly', async () => {
    // Mock the return value of useInventoryItems
    vi.mocked(useInventoryItems).mockReturnValue({
      data: mockInventory,
      isLoading: false,
      error: null,
    } as any)

    renderWithClient(<ManagerInventoryPage />)

    // Wait for the component to render with the mock data
    await waitFor(() => {
      // Check Total Inventory Value
      const valueCard = screen
        .getByText('Total Inventory Value')
        .closest('div.rounded-xl')
      expect(within(valueCard).getByText('$980.00')).toBeInTheDocument()

      // Check Items Low on Stock
      const lowStockCard = screen
        .getByText('Items Low on Stock')
        .closest('div.rounded-xl')
      expect(within(lowStockCard).getByText('1')).toBeInTheDocument()

      // Check Out of Stock Items
      const outOfStockCard = screen
        .getByText('Out of Stock Items')
        .closest('div.rounded-xl')
      expect(within(outOfStockCard).getByText('1')).toBeInTheDocument()
    })
  })

  it('displays loading state correctly', () => {
    vi.mocked(useInventoryItems).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any)

    renderWithClient(<ManagerInventoryPage />)

    expect(screen.getByRole('status')).toBeInTheDocument() // Assuming Loader2 has a role of status
  })

  it('displays error state correctly', () => {
    vi.mocked(useInventoryItems).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as any)

    renderWithClient(<ManagerInventoryPage />)

    expect(
      screen.getByText('Failed to load inventory items.')
    ).toBeInTheDocument()
  })

  it('displays empty state correctly', () => {
    vi.mocked(useInventoryItems).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    renderWithClient(<ManagerInventoryPage />)

    expect(screen.getByText('No Inventory Items')).toBeInTheDocument()
  })
})
