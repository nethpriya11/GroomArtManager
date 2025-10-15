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
  setDoc,
} from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  updatePassword,
} from 'firebase/auth'
import { db } from '@/lib/firebase/config'
import type { UserProfile } from '@/types/firestore'

/**
 * Barber Repository
 *
 * Handles all Firestore operations for barbers (users with role='barber').
 */

const COLLECTION_NAME = 'users'

/**
 * Create a new barber
 *
 * @param data - Barber data (username, commissionRate, avatarUrl)
 * @returns Promise<UserProfile> - Created barber with generated ID
 */
export async function createBarber(data: {
  username: string
  password: string
  avatarUrl?: string | null
}): Promise<UserProfile> {
  const auth = getAuth()
  const email = `${data.username.toLowerCase().replace(/\s/g, '')}@salonflow.com`

  // 1. Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    data.password
  )
  const uid = userCredential.user.uid

  // 2. Create user profile in Firestore
  const barberData = {
    username: data.username,
    email: email,
    role: 'barber' as const,
    avatarUrl: data.avatarUrl || null,
    createdAt: Timestamp.now(),
  }

  await setDoc(doc(db, COLLECTION_NAME, uid), barberData)

  return {
    id: uid,
    ...barberData,
  }
}

/**
 * Get a barber by ID
 *
 * @param barberId - Barber document ID
 * @returns Promise<UserProfile | null> - Barber or null if not found
 */
export async function getBarber(barberId: string): Promise<UserProfile | null> {
  const docRef = doc(db, COLLECTION_NAME, barberId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists() || docSnap.data().role !== 'barber') {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as UserProfile
}

/**
 * Get all barbers
 *
 * @returns Promise<UserProfile[]> - Array of all barbers, ordered by username
 */
export async function getAllBarbers(): Promise<UserProfile[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('role', '==', 'barber'),
    orderBy('username', 'asc')
  )
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as UserProfile
  )
}

/**
 * Update a barber
 *
 * @param barberId - Barber document ID
 * @param data - Partial barber data to update
 * @returns Promise<void>
 */
export async function updateBarber(
  barberId: string,
  data: Partial<Pick<UserProfile, 'username' | 'avatarUrl'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, barberId)
  // Note: Updating a user's password from the client-side for another user
  // is not directly possible with Firebase client SDK. It requires the user
  // to be currently authenticated as that user, or using the Firebase Admin SDK
  // on a backend server. For this application, password updates for existing
  // barbers by a manager would need a backend function or a different flow.
  await updateDoc(docRef, data)
}

/**
 * Delete a barber
 *
 * @param barberId - Barber document ID
 * @returns Promise<void>
 */
export async function deleteBarber(barberId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, barberId)
  await deleteDoc(docRef)
}
