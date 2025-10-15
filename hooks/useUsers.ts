import { collection, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useRealtimeQuery } from './useRealtimeQuery'
import type { UserProfile } from '@/types/firestore'

/**
 * Custom hook to fetch all users in real-time
 *
 * @returns Query result with users array, loading state, and error state
 *
 * @example
 * ```tsx
 * const { data: users, isLoading, error } = useUsers()
 * ```
 */
export function useUsers() {
  const usersQuery = query(collection(db, 'users'), orderBy('username', 'asc'))

  return useRealtimeQuery<UserProfile>(['users'], usersQuery)
}

/**
 * Custom hook to fetch only barbers in real-time
 *
 * @returns Query result with barbers array, loading state, and error state
 *
 * @example
 * ```tsx
 * const { data: barbers, isLoading } = useBarbers()
 * ```
 */
export function useBarbers() {
  const { data: users, ...rest } = useUsers()

  const barbers = users?.filter((user) => user.role === 'barber') || []

  return {
    data: barbers,
    ...rest,
  }
}
