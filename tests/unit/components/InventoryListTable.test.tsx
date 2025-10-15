import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { InventoryListTable } from '@/components/features/inventory/InventoryListTable'
import type { InventoryItem } from '@/types/inventory'
import { Timestamp } from 'firebase/firestore'

const mockItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Shampoo',
    brand: 'Brand A',
    category: 'Hair Care',
    sku: 'SKU001',
    stock: 10,
    price: 15.99,
    costPrice: 5.5,
    reorderPoint: 5,
    unitOfMeasure: 'bottle',
    createdAt: Timestamp.fromDate(new Date('2023-01-01')),
    lastUpdated: Timestamp.fromDate(new Date('2023-10-28')),
  },
  {
    id: '2',
    name: 'Conditioner',
    brand: 'Brand B',
    category: 'Hair Care',
    sku: 'SKU002',
    stock: 3,
    price: 16.99,
    costPrice: 6.0,
    reorderPoint: 5,
    unitOfMeasure: 'bottle',
    createdAt: Timestamp.fromDate(new Date('2023-01-02')),
    lastUpdated: Timestamp.fromDate(new Date('2023-10-29')),
  },
]

describe('InventoryListTable', () => {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  const onAdjustStock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders table headers correctly', () => {
    render(
      <InventoryListTable
        items={mockItems}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdjustStock={onAdjustStock}
      />
    )
    expect(screen.getByText('Item Name')).toBeInTheDocument()
    expect(screen.getByText('Brand')).toBeInTheDocument()
    expect(screen.getByText('Stock')).toBeInTheDocument()
    expect(screen.getByText('Last Updated')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders item data correctly', () => {
    render(
      <InventoryListTable
        items={mockItems}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdjustStock={onAdjustStock}
      />
    )
    expect(screen.getByText('Shampoo')).toBeInTheDocument()
    expect(screen.getByText('Brand A')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(
      screen.getByText(new Date('2023-10-28').toLocaleDateString())
    ).toBeInTheDocument()
  })

  it('applies low-stock highlighting', () => {
    render(
      <InventoryListTable
        items={mockItems}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdjustStock={onAdjustStock}
      />
    )
    const normalStockRow = screen.getByText('Shampoo').closest('tr')
    const lowStockRow = screen.getByText('Conditioner').closest('tr')

    expect(lowStockRow).toHaveClass('bg-red-900/20')
    expect(normalStockRow).not.toHaveClass('bg-red-900/20')
  })

  it('calls onEdit when edit button is clicked', () => {
    render(
      <InventoryListTable
        items={mockItems}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdjustStock={onAdjustStock}
      />
    )
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])
    expect(onEdit).toHaveBeenCalledWith(mockItems[0])
  })

  it('calls onDelete when delete button is clicked', () => {
    render(
      <InventoryListTable
        items={mockItems}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdjustStock={onAdjustStock}
      />
    )
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])
    expect(onDelete).toHaveBeenCalledWith(mockItems[0].id)
  })

  it('calls onAdjustStock when adjust stock button is clicked', () => {
    render(
      <InventoryListTable
        items={mockItems}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdjustStock={onAdjustStock}
      />
    )
    const adjustButtons = screen.getAllByRole('button', {
      name: /adjust stock/i,
    })
    fireEvent.click(adjustButtons[0])
    expect(onAdjustStock).toHaveBeenCalledWith(mockItems[0])
  })
})
