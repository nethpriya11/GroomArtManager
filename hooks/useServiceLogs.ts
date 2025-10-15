'use client'

import {
  collection,
  query,
  where,
  orderBy,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { ServiceLog } from '@/types/firestore'
import { useRealtimeQuery } from './useRealtimeQuery'

/**
 * Hook for fetching all service logs with real-time updates
 *
 * @param status - Optional status filter ('pending', 'approved', 'rejected')
 * @returns Query result with service logs data, loading state, and error
 *
 * @example
 * ```tsx
 * function ServiceLogsList() {
 *   const { data: logs, isLoading, error } = useServiceLogs('approved')
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <div>
 *       {logs?.map((log) => (
 *         <div key={log.id}>{log.id}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useServiceLogs(status?: 'pending' | 'approved' | 'rejected') {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]

  if (status) {
    constraints.unshift(where('status', '==', status))
  }

  const logsQuery = query(collection(db, 'serviceLogs'), ...constraints)

  const queryKey = status ? ['serviceLogs', status] : ['serviceLogs']

  return useRealtimeQuery<ServiceLog>(queryKey, logsQuery)
}

/**
 * Hook for fetching pending service logs (for manager approval)
 *
 * Returns all service logs with status='pending' sorted by createdAt ascending.
 * Automatically updates when logs are added/updated/deleted in Firestore.
 *
 * @example
 * ```tsx
 * function ManagerApprovalQueue() {
 *   const { data: pendingLogs, isLoading, error } = usePendingServiceLogs()
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <div>
 *       {pendingLogs?.map((log) => (
 *         <div key={log.id}>Log #{log.id}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePendingServiceLogs() {
  const logsQuery = query(
    collection(db, 'serviceLogs'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  )

  return useRealtimeQuery<ServiceLog>(['serviceLogs', 'pending'], logsQuery)
}

/**
 * Hook for fetching service logs for a specific barber
 *
 * @param barberId - Barber user ID
 * @param status - Optional status filter ('pending', 'approved', 'rejected')
 * @returns Query result with barber's service logs data, loading state, and error
 *
 * @example
 * ```tsx
 * function BarberLogs({ barberId }: { barberId: string }) {
 *   const { data: logs, isLoading, error } = useBarberServiceLogs(barberId)
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <div>
 *       {logs?.map((log) => (
 *         <div key={log.id}>{log.id}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBarberServiceLogs(
  barberId: string,
  status?: 'pending' | 'approved' | 'rejected'
) {
  const constraints: QueryConstraint[] = [
    where('barberId', '==', barberId),
    orderBy('createdAt', 'desc'),
  ]

  if (status) {
    constraints.splice(1, 0, where('status', '==', status))
  }

  const logsQuery = query(collection(db, 'serviceLogs'), ...constraints)

  const queryKey = status
    ? ['serviceLogs', 'barber', barberId, status]
    : ['serviceLogs', 'barber', barberId]

  return useRealtimeQuery<ServiceLog>(queryKey, logsQuery)
}
