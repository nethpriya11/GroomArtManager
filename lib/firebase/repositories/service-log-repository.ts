import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type {
  ServiceLog,
  ServiceLogPopulated,
  UserProfile,
  Service,
} from '@/types/firestore'

/**
 * Service Log Repository
 *
 * Handles all Firestore operations for service logs.
 * Includes CRUD operations and specialized queries for barber/manager workflows.
 */

const COLLECTION_NAME = 'serviceLogs'

/**
 * Create a new service log
 *
 * @param data - Service log data
 * @returns Promise<ServiceLog> - Created service log with generated ID
 */
export async function createServiceLog(data: {
  barberId: string
  serviceId: string
  price: number
  commissionRate: number
  commissionAmount: number
}): Promise<ServiceLog> {
  const logData = {
    ...data,
    status: 'pending' as const,
    createdAt: Timestamp.now(),
    approvedAt: null,
    rejectedAt: null,
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), logData)

  return {
    id: docRef.id,
    ...logData,
  }
}

/**
 * Get a service log by ID
 *
 * @param logId - Service log document ID
 * @returns Promise<ServiceLog | null> - Service log or null if not found
 */
export async function getServiceLog(logId: string): Promise<ServiceLog | null> {
  const docRef = doc(db, COLLECTION_NAME, logId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as ServiceLog
}

/**
 * Get all service logs for a specific barber
 *
 * @param barberId - Barber user ID
 * @param status - Optional status filter ('pending', 'approved', 'rejected')
 * @returns Promise<ServiceLog[]> - Array of service logs, ordered by createdAt desc
 */
export async function getServiceLogsByBarber(
  barberId: string,
  status?: 'pending' | 'approved' | 'rejected'
): Promise<ServiceLog[]> {
  const constraints: QueryConstraint[] = [
    where('barberId', '==', barberId),
    orderBy('createdAt', 'desc'),
  ]

  if (status) {
    constraints.splice(1, 0, where('status', '==', status))
  }

  const q = query(collection(db, COLLECTION_NAME), ...constraints)
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as ServiceLog
  )
}

/**
 * Get all pending service logs (for manager approval)
 *
 * @returns Promise<ServiceLog[]> - Array of pending logs, ordered by createdAt asc
 */
export async function getPendingServiceLogs(): Promise<ServiceLog[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  )
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as ServiceLog
  )
}

/**
 * Get all service logs within a date range
 *
 * @param startDate - Start date (inclusive)
 * @param endDate - End date (inclusive)
 * @param status - Optional status filter
 * @returns Promise<ServiceLog[]> - Array of service logs
 */
export async function getServiceLogsByDateRange(
  startDate: Date,
  endDate: Date,
  status?: 'pending' | 'approved' | 'rejected'
): Promise<ServiceLog[]> {
  const constraints: QueryConstraint[] = [
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc'),
  ]

  if (status) {
    constraints.splice(2, 0, where('status', '==', status))
  }

  const q = query(collection(db, COLLECTION_NAME), ...constraints)
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as ServiceLog
  )
}

/**
 * Get all service logs (for reports)
 *
 * @param status - Optional status filter
 * @returns Promise<ServiceLog[]> - Array of all service logs
 */
export async function getAllServiceLogs(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<ServiceLog[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]

  if (status) {
    constraints.unshift(where('status', '==', status))
  }

  const q = query(collection(db, COLLECTION_NAME), ...constraints)
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as ServiceLog
  )
}

/**
 * Approve a service log
 *
 * @param logId - Service log document ID
 * @returns Promise<void>
 */
export async function approveServiceLog(logId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, logId)
  await updateDoc(docRef, {
    status: 'approved',
    approvedAt: Timestamp.now(),
  })
}

/**
 * Reject a service log
 *
 * @param logId - Service log document ID
 * @returns Promise<void>
 */
export async function rejectServiceLog(logId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, logId)
  await updateDoc(docRef, {
    status: 'rejected',
    rejectedAt: Timestamp.now(),
  })
}

/**
 * Delete a service log (only for pending logs)
 *
 * @param logId - Service log document ID
 * @returns Promise<void>
 */
export async function deleteServiceLog(logId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, logId)
  await deleteDoc(docRef)
}

/**
 * Get populated service logs with barber and service details
 * This is a helper function for displaying logs with full context
 *
 * @param logs - Array of service logs
 * @returns Promise<ServiceLogPopulated[]> - Logs with populated barber and service data
 */
export async function populateServiceLogs(
  logs: ServiceLog[]
): Promise<ServiceLogPopulated[]> {
  if (logs.length === 0) return []

  // Get unique barber and service IDs
  const barberIds = [...new Set(logs.map((log) => log.barberId))]
  const serviceIds = [...new Set(logs.map((log) => log.serviceId))]

  // Fetch all barbers and services in parallel
  const [barbers, services] = await Promise.all([
    Promise.all(
      barberIds.map(async (id) => {
        const docRef = doc(db, 'users', id)
        const docSnap = await getDoc(docRef)
        return docSnap.exists()
          ? ({ id: docSnap.id, ...docSnap.data() } as UserProfile)
          : null
      })
    ),
    Promise.all(
      serviceIds.map(async (id) => {
        const docRef = doc(db, 'services', id)
        const docSnap = await getDoc(docRef)
        return docSnap.exists()
          ? ({ id: docSnap.id, ...docSnap.data() } as Service)
          : null
      })
    ),
  ])

  // Create lookup maps
  const barberMap = new Map(
    barbers.filter((b) => b !== null).map((b) => [b!.id, b!])
  )
  const serviceMap = new Map(
    services.filter((s) => s !== null).map((s) => [s!.id, s!])
  )

  // Populate logs
  return logs
    .map((log) => {
      const barber = barberMap.get(log.barberId)
      const service = serviceMap.get(log.serviceId)

      if (!barber || !service) return null

      return {
        ...log,
        barber,
        service,
      } as ServiceLogPopulated
    })
    .filter((log) => log !== null) as ServiceLogPopulated[]
}
