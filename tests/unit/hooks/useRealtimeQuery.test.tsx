import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRealtimeQuery } from '@/hooks/useRealtimeQuery'
import { onSnapshot, Query } from 'firebase/firestore'
import { ReactNode } from 'react'

// Mock Firebase Firestore
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore')
  return {
    ...actual,
    onSnapshot: vi.fn(),
  }
})

const mockOnSnapshot = vi.mocked(onSnapshot)

describe('useRealtimeQuery', () => {
  let queryClient: QueryClient

  // Create a wrapper with QueryClient for React Query hooks
  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries in tests
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

  it('creates Firestore listener on mount', async () => {
    const mockQuery = {} as Query
    const mockUnsubscribe = vi.fn()

    // Mock onSnapshot to call success callback
    mockOnSnapshot.mockImplementation((query, onNext) => {
      onNext({
        docs: [
          {
            id: 'doc1',
            data: () => ({ name: 'Test Service', price: 25 }),
          },
        ],
      } as any)
      return mockUnsubscribe
    })

    const { result } = renderHook(
      () => useRealtimeQuery(['test-query'], mockQuery),
      {
        wrapper: createWrapper(),
      }
    )

    // Wait for query to succeed
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify onSnapshot was called with the query
    expect(mockOnSnapshot).toHaveBeenCalledWith(
      mockQuery,
      expect.any(Function),
      expect.any(Function)
    )
  })

  it('returns data from Firestore snapshot', async () => {
    const mockQuery = {} as Query
    const mockUnsubscribe = vi.fn()

    const mockData = [
      { name: 'Service 1', price: 25 },
      { name: 'Service 2', price: 35 },
    ]

    mockOnSnapshot.mockImplementation((query, onNext) => {
      onNext({
        docs: mockData.map((item, index) => ({
          id: `doc${index + 1}`,
          data: () => item,
        })),
      } as any)
      return mockUnsubscribe
    })

    const { result } = renderHook(
      () => useRealtimeQuery(['test-query'], mockQuery),
      {
        wrapper: createWrapper(),
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify data includes IDs and document data
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data).toEqual([
      { id: 'doc1', name: 'Service 1', price: 25 },
      { id: 'doc2', name: 'Service 2', price: 35 },
    ])
  })

  it('handles Firestore errors', async () => {
    const mockQuery = {} as Query
    const mockUnsubscribe = vi.fn()
    const mockError = new Error('Firestore connection failed')

    mockOnSnapshot.mockImplementation((query, onNext, onError) => {
      // Simulate error
      if (onError) {
        onError(mockError as any)
      }
      return mockUnsubscribe
    })

    const { result } = renderHook(
      () => useRealtimeQuery(['test-query'], mockQuery),
      {
        wrapper: createWrapper(),
      }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(mockError)
  })

  it('returns unsubscribe function for cleanup', async () => {
    const mockQuery = {} as Query
    const mockUnsubscribe = vi.fn()

    mockOnSnapshot.mockImplementation((query, onNext) => {
      onNext({
        docs: [],
      } as any)
      return mockUnsubscribe
    })

    const { result } = renderHook(
      () => useRealtimeQuery(['test-query'], mockQuery),
      {
        wrapper: createWrapper(),
      }
    )

    // Wait for listener to be created
    await waitFor(() => expect(mockOnSnapshot).toHaveBeenCalled())

    // Verify unsubscribe function is returned from onSnapshot
    // React Query will call this automatically on cleanup
    expect(mockOnSnapshot).toHaveReturnedWith(mockUnsubscribe)
  })

  it('handles empty collection', async () => {
    const mockQuery = {} as Query
    const mockUnsubscribe = vi.fn()

    mockOnSnapshot.mockImplementation((query, onNext) => {
      onNext({
        docs: [],
      } as any)
      return mockUnsubscribe
    })

    const { result } = renderHook(
      () => useRealtimeQuery(['test-query'], mockQuery),
      {
        wrapper: createWrapper(),
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('uses staleTime: Infinity for real-time data', async () => {
    const mockQuery = {} as Query
    const mockUnsubscribe = vi.fn()

    mockOnSnapshot.mockImplementation((query, onNext) => {
      onNext({
        docs: [{ id: 'doc1', data: () => ({ name: 'Test' }) }],
      } as any)
      return mockUnsubscribe
    })

    const { result } = renderHook(
      () => useRealtimeQuery(['test-query'], mockQuery),
      {
        wrapper: createWrapper(),
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Data should never be stale (staleTime: Infinity)
    expect(result.current.isStale).toBe(false)
  })

  it('accepts custom React Query options', async () => {
    const mockQuery = {} as Query
    const mockUnsubscribe = vi.fn()
    const onSuccess = vi.fn()

    mockOnSnapshot.mockImplementation((query, onNext) => {
      onNext({
        docs: [{ id: 'doc1', data: () => ({ name: 'Test' }) }],
      } as any)
      return mockUnsubscribe
    })

    const { result } = renderHook(
      () =>
        useRealtimeQuery(['test-query'], mockQuery, {
          enabled: true,
        }),
      {
        wrapper: createWrapper(),
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()
  })
})
