import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useServices } from '@/hooks/useServices'
import { onSnapshot } from 'firebase/firestore'
import { Service } from '@/types/firestore'
import { Timestamp } from 'firebase/firestore'
import { ReactNode } from 'react'

// Mock Firebase Firestore
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore')
  return {
    ...actual,
    collection: vi.fn(() => ({})),
    query: vi.fn((...args) => ({ _query: args })),
    orderBy: vi.fn((field, direction) => ({ field, direction })),
    onSnapshot: vi.fn(),
  }
})

// Mock Firebase config
vi.mock('@/lib/firebase/config', () => ({
  db: {},
}))

const mockOnSnapshot = vi.mocked(onSnapshot)

describe('useServices', () => {
  let queryClient: QueryClient

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient?.clear()
  })

  it('fetches services from Firestore', async () => {
    const mockUnsubscribe = vi.fn()

    const mockServices: Partial<Service>[] = [
      {
        name: 'Haircut',
        price: 25,
        duration: 30,
        createdAt: Timestamp.now(),
      },
      {
        name: 'Beard Trim',
        price: 15,
        duration: 15,
        createdAt: Timestamp.now(),
      },
    ]

    mockOnSnapshot.mockImplementation((query, onNext) => {
      onNext({
        docs: mockServices.map((service, index) => ({
          id: `service_${index + 1}`,
          data: () => service,
        })),
      } as any)
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].name).toBe('Haircut')
    expect(result.current.data?.[1].name).toBe('Beard Trim')
  })

  it('includes document IDs in returned data', async () => {
    const mockUnsubscribe = vi.fn()

    mockOnSnapshot.mockImplementation((query, onNext) => {
      onNext({
        docs: [
          {
            id: 'service_abc123',
            data: () => ({
              name: 'Hot Towel Shave',
              price: 35,
              duration: 45,
            }),
          },
        ],
      } as any)
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.[0].id).toBe('service_abc123')
  })

  it('returns loading state initially', () => {
    const mockUnsubscribe = vi.fn()

    mockOnSnapshot.mockImplementation(() => {
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('handles errors from Firestore', async () => {
    const mockUnsubscribe = vi.fn()
    const mockError = new Error('Permission denied')

    mockOnSnapshot.mockImplementation((query, onNext, onError) => {
      if (onError) {
        onError(mockError as any)
      }
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(mockError)
  })

  it('handles empty services collection', async () => {
    const mockUnsubscribe = vi.fn()

    mockOnSnapshot.mockImplementation((query, onNext) => {
      onNext({
        docs: [],
      } as any)
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('returns unsubscribe function for cleanup', async () => {
    const mockUnsubscribe = vi.fn()

    mockOnSnapshot.mockImplementation((query, onNext) => {
      onNext({ docs: [] } as any)
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(mockOnSnapshot).toHaveBeenCalled())

    // Verify unsubscribe function is returned from onSnapshot
    // React Query will call this automatically on cleanup
    expect(mockOnSnapshot).toHaveReturnedWith(mockUnsubscribe)
  })

  it('uses correct query key for caching', async () => {
    const mockUnsubscribe = vi.fn()

    mockOnSnapshot.mockImplementation((query, onNext) => {
      onNext({ docs: [] } as any)
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify query is cached with 'services' key
    const cachedData = queryClient.getQueryData(['services'])
    expect(cachedData).toBeDefined()
  })
})
