import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { UserProfile } from '@/types/firestore'

/**
 * Authentication service for Firebase Auth
 *
 * Handles user authentication and profile retrieval from Firestore.
 */

/**
 * Manager credentials (sole manager account)
 */
const MANAGER_EMAIL = 'manager@salonflow.com'
const MANAGER_PASSWORD = 'manager123'

/**
 * Sign in with email and password
 *
 * Authenticates a user with their email and password and retrieves their profile from Firestore.
 *
 * @param email - User email address
 * @param password - User password
 * @returns Promise<UserProfile> - User profile
 * @throws Error if authentication fails or profile not found
 *
 * @example
 * ```tsx
 * try {
 *   const user = await signInWithCredentials('manager@salonflow.com', 'password123')
 *   authStore.login(user)
 *   router.push('/manager/dashboard')
 * } catch (error) {
 *   toast.error('Invalid credentials')
 * }
 * ```
 */
export async function signInWithCredentials(
  email: string,
  password: string
): Promise<UserProfile> {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )

    // Fetch user profile from Firestore
    const userProfile = await getUserProfile(userCredential.user.uid)

    return userProfile
  } catch (error) {
    console.error('Sign-in failed:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === 'auth/network-request-failed'
    ) {
      throw new Error(
        'Network error: Could not connect to authentication service.'
      )
    }
    throw new Error('Invalid email or password')
  }
}

/**
 * Sign in as the manager user
 *
 * Authenticates the sole manager account and retrieves their profile from Firestore.
 *
 * @returns Promise<UserProfile> - Manager user profile
 * @throws Error if authentication fails or profile not found
 *
 * @example
 * ```tsx
 * try {
 *   const manager = await signInAsManager()
 *   authStore.login(manager)
 *   router.push('/manager/dashboard')
 * } catch (error) {
 *   toast.error('Failed to sign in')
 * }
 * ```
 */
export async function signInAsManager(): Promise<UserProfile> {
  return signInWithCredentials(MANAGER_EMAIL, MANAGER_PASSWORD)
}

/**
 * Sign in as a specific barber
 *
 * Authenticates a barber account using their ID and retrieves their profile from Firestore.
 * Barber credentials are derived from barberId (e.g., barber1@salonflow.com).
 *
 * @param barberId - User ID of the barber
 * @returns Promise<UserProfile> - Barber user profile
 * @throws Error if authentication fails or profile not found
 *
 * @example
 * ```tsx
 * try {
 *   const barber = await signInAsBarber(selectedBarberId)
 *   authStore.login(barber)
 *   router.push('/barber/dashboard')
 * } catch (error) {
 *   toast.error('Failed to sign in')
 * }
 * ```
 */
export async function signInAsBarber(
  barberId: string,
  password: string
): Promise<UserProfile> {
  try {
    // Fetch barber profile first to get their credentials
    const barberProfile = await getUserProfile(barberId)

    // Verify user is actually a barber
    if (barberProfile.role !== 'barber') {
      throw new Error('User is not a barber')
    }

    // Use email from profile
    const barberEmail = barberProfile.email

    // Sign in with Firebase Auth
    await signInWithEmailAndPassword(auth, barberEmail, password)

    return barberProfile
  } catch (error) {
    console.error('Barber sign-in failed:', error)
    throw new Error('Failed to sign in as barber. Please try again.')
  }
}

/**
 * Get user profile from Firestore
 *
 * @param userId - Firebase Auth UID
 * @returns Promise<UserProfile> - User profile document
 * @throws Error if profile not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  console.log('Fetching user profile for UID:', userId)
  const userDoc = await getDoc(doc(db, 'users', userId))

  if (!userDoc.exists()) {
    console.error('User document does not exist at path: users/' + userId)
    throw new Error('User profile not found')
  }

  console.log('User profile found:', userDoc.data())
  return userDoc.data() as UserProfile
}

/**
 * Sign out the current user
 *
 * @example
 * ```tsx
 * await signOut()
 * authStore.logout()
 * router.push('/login')
 * ```
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

/**
 * Subscribe to authentication state changes
 *
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const unsubscribe = onAuthChange((user) => {
 *     if (user) {
 *       // User is signed in
 *     } else {
 *       // User is signed out
 *     }
 *   })
 *
 *   return unsubscribe
 * }, [])
 * ```
 */
export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback)
}

/**
 * Get the currently signed-in user
 *
 * @returns User | null - Current Firebase Auth user or null if not signed in
 */
export function getCurrentUser(): User | null {
  return auth.currentUser
}
