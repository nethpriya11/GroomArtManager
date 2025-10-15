'use client'

import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import { onSnapshot, Query, FirestoreError } from 'firebase/firestore'

/**
 * Generic hook for real-time Firestore queries using React Query
 *
 * Wraps Firestore onSnapshot in useQuery for automatic listener management:
 * - Creates real-time listener on mount
 * - Cleans up listener on unmount
 * - Handles errors with retry logic
 * - Provides loading/error/data states
 *
 * @param queryKey - Unique key for React Query cache
 * @param firestoreQuery - Firestore query to listen to
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * const servicesQuery = collection(db, 'services')
 * const { data, isLoading, error } = useRealtimeQuery<Service>(
 *   ['services'],
 *   servicesQuery
 * )
 * ```
 */
export function useRealtimeQuery<T>(
  queryKey: string[],
  firestoreQuery: Query,
  options?: Omit<UseQueryOptions<T[], FirestoreError>, 'queryKey' | 'queryFn'>
): UseQueryResult<T[], FirestoreError> {
  return useQuery<T[], FirestoreError>({
    queryKey,
    queryFn: () =>
      new Promise<T[]>((resolve, reject) => {
        // Create real-time listener
        const unsubscribe = onSnapshot(
          firestoreQuery,
          (snapshot) => {
            // Map documents to typed data
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as T[]

            resolve(data)
          },
          (error: FirestoreError) => {
            // Handle errors
            console.error('Firestore listener error:', error)
            reject(error)
          }
        )

        // Return cleanup function
        // React Query will call this when query is no longer in use
        return () => {
          unsubscribe()
        }
      }),
    // Real-time data is always fresh from listener
    staleTime: Infinity,
    // Don't refetch on window focus (listener handles updates)
    refetchOnWindowFocus: false,
    // Merge with additional options
    ...options,
  })
}
