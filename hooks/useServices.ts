'use client'

import { collection, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Service } from '@/types/firestore'
import { useRealtimeQuery } from './useRealtimeQuery'

/**
 * Hook for fetching all services with real-time updates
 *
 * Returns services sorted by creation date (newest first).
 * Automatically updates when services are added/updated/deleted in Firestore.
 *
 * @example
 * ```tsx
 * function ServicesList() {
 *   const { data: services, isLoading, error } = useServices()
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <ul>
 *       {services?.map((service) => (
 *         <li key={service.id}>{service.name} - ${service.price}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useServices() {
  // Create Firestore query for services collection
  const servicesQuery = query(
    collection(db, 'services'),
    orderBy('createdAt', 'desc')
  )

  // Use real-time query hook
  return useRealtimeQuery<Service>(['services'], servicesQuery)
}
