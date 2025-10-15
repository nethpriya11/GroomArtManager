import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth'

/**
 * Firebase configuration from environment variables
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/**
 * Validate Firebase configuration
 */
function validateFirebaseConfig() {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ] as const

  const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key])

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingKeys.map((key) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase().replace(/([A-Z])/g, '_$1')}`).join(', ')}`
    )
  }
}

// Validate config on initialization
validateFirebaseConfig()

/**
 * Initialize Firebase app (singleton pattern)
 */
let app: FirebaseApp

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]!
}

/**
 * Initialize Firestore
 */
const db: Firestore = getFirestore(app)

/**
 * Initialize Firebase Authentication
 */
const auth: Auth = getAuth(app)

/**
 * Connect to Firebase Emulators if in development mode
 */
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'

  if (useEmulator) {
    try {
      // Connect to Firestore Emulator
      connectFirestoreEmulator(db, 'localhost', 8081)
      console.log('🔥 Connected to Firestore Emulator on port 8081')

      // Connect to Auth Emulator
      connectAuthEmulator(auth, 'http://localhost:9099', {
        disableWarnings: true,
      })
      console.log('🔥 Connected to Auth Emulator on port 9099')
    } catch (error) {
      // Emulator already connected (happens on hot reload)
      console.warn('Emulator connection already established')
    }
  }
}

export { app, db, auth }
