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
 * Sign in as a hardcoded manager (INSECURE - FOR NON-COMMERCIAL USE ONLY)
 *
 * Directly retrieves the manager profile from Firestore without Firebase Auth.
 * This bypasses authentication and is highly insecure.
 * The UID must correspond to a manager user in Firestore.
 *
 * @returns Promise<UserProfile> - Manager user profile
 * @throws Error if profile not found
 */
export async function signInAsHardcodedManager(): Promise<UserProfile> {
  console.warn('WARNING: Using insecure hardcoded manager login.')
  // Replace with the actual UID of your manager user in Firestore
  const managerUid = 'Puh0mA0SuyL3hqwujIrsRDOskNB3' 
  return getUserProfile(managerUid)
}

/**
 * Sign in as a hardcoded barber (INSECURE - FOR NON-COMMERCIAL USE ONLY)
 *
 * Directly retrieves a barber profile from Firestore without Firebase Auth.
 * This bypasses authentication and is highly insecure.
 * The UID must correspond to a barber user in Firestore.
 *
 * @returns Promise<UserProfile> - Barber user profile
 * @throws Error if profile not found
 */
export async function signInAsHardcodedBarber(): Promise<UserProfile> {
  console.warn('WARNING: Using insecure hardcoded barber login.')
  // Replace with the actual UID of a barber user in Firestore
  const barberUid = 'YOUR_BARBER_UID_HERE' 
  return getUserProfile(barberUid)
}

/**
 * Sign in with Google using a popup
 *
 * Authenticates a user with their Google account and retrieves/creates their profile in Firestore.
 *
 * @returns Promise<UserProfile> - User profile
 * @throws Error if authentication fails
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    // Check if user profile exists in Firestore, create if not
    const userProfile = await getUserProfile(user.uid).catch(async () => {
      // If profile not found, create a basic one
      const newProfile: UserProfile = {
        id: user.uid,
        username: user.displayName || 'Google User',
        email: user.email || '',
        role: 'barber', // Default role, can be changed by manager later
        createdAt: new Date(),
      }
      await setDoc(doc(db, 'users', user.uid), newProfile)
      return newProfile
    })

    return userProfile
  } catch (error) {
    console.error('Google sign-in failed:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === 'auth/popup-closed-by-user'
    ) {
      throw new Error('Google sign-in popup closed.')
    }
    throw new Error('Failed to sign in with Google. Please try again.')
  }
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