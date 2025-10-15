import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Service } from '@/types/firestore'
import type { CreateServiceInput } from '@/lib/validations/schemas'

/**
 * Service Repository
 *
 * Handles all Firestore operations for services collection.
 * Uses repository pattern to abstract database operations.
 */

const COLLECTION_NAME = 'services'

/**
 * Create a new service
 *
 * @param data - Service data (name, price, duration)
 * @returns Promise<Service> - Created service with generated ID
 */
export async function createService(
  data: CreateServiceInput
): Promise<Service> {
  const serviceData = {
    ...data,
    createdAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), serviceData)

  return {
    id: docRef.id,
    ...serviceData,
  }
}

/**
 * Get a service by ID
 *
 * @param serviceId - Service document ID
 * @returns Promise<Service | null> - Service or null if not found
 */
export async function getService(serviceId: string): Promise<Service | null> {
  const docRef = doc(db, COLLECTION_NAME, serviceId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Service
}

/**
 * Get all services
 *
 * @returns Promise<Service[]> - Array of all services, ordered by createdAt desc
 */
export async function getAllServices(): Promise<Service[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Service
  )
}

/**
 * Update a service
 *
 * @param serviceId - Service document ID
 * @param data - Partial service data to update
 * @returns Promise<void>
 */
export async function updateService(
  serviceId: string,
  data: Partial<Omit<Service, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, serviceId)
  await updateDoc(docRef, data)
}

/**
 * Delete a service
 *
 * @param serviceId - Service document ID
 * @returns Promise<void>
 */
export async function deleteService(serviceId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, serviceId)
  await deleteDoc(docRef)
}
