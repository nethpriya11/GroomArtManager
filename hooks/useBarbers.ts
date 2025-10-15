'use client'

import { collection, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { UserProfile } from '@/types/firestore'
import { useRealtimeQuery } from './useRealtimeQuery'

/**
 * Hook for fetching all barbers with real-time updates
 *
 * Returns all users with role='barber' sorted by username.
 * Automatically updates when barbers are added/updated/deleted in Firestore.
 *
 * @example
 * ```tsx
 * function BarberSelection() {
 *   const { data: barbers, isLoading, error } = useBarbers()
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <div>
 *       {barbers?.map((barber) => (
 *         <div key={barber.id}>{barber.username}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBarbers() {
  // Create Firestore query for barbers only
  const barbersQuery = query(
    collection(db, 'users'),
    where('role', '==', 'barber'),
    orderBy('username', 'asc')
  )

  // Use real-time query hook
  return useRealtimeQuery<UserProfile>(['users', 'barbers'], barbersQuery)
}
