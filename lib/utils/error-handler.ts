import { toast } from 'sonner'
import { FirebaseError } from 'firebase/app'

/**
 * Error handling utility for displaying user-friendly error messages
 *
 * Transforms Firebase and network errors into user-friendly messages
 * and displays them using Sonner toast notifications.
 */

/**
 * Handle and display errors to the user
 *
 * Logs the error to console and shows a user-friendly toast notification.
 * Transforms Firebase errors into readable messages.
 *
 * @param error - Error object (unknown type for safety)
 * @param context - Context where error occurred (for logging)
 *
 * @example
 * ```tsx
 * try {
 *   await signInAsManager()
 * } catch (error) {
 *   handleError(error, 'LoginPage.handleManagerLogin')
 * }
 * ```
 */
export function handleError(error: unknown, context: string): void {
  // Log to console for debugging
  console.error(`[${context}]`, error)

  // Transform error to user-friendly message
  const userMessage = getErrorMessage(error)

  // Display toast notification
  toast.error(userMessage)

  // In production, send to error monitoring service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry/error monitoring service
    // Sentry.captureException(error, { tags: { context } })
  }
}

/**
 * Transform error into user-friendly message
 *
 * @param error - Error object
 * @returns User-friendly error message
 */
function getErrorMessage(error: unknown): string {
  // Handle Firebase errors
  if (error instanceof FirebaseError) {
    return getFirebaseErrorMessage(error)
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Unknown error type
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Get user-friendly message for Firebase errors
 *
 * @param error - Firebase error
 * @returns User-friendly error message
 */
function getFirebaseErrorMessage(error: FirebaseError): string {
  switch (error.code) {
    // Authentication errors
    case 'auth/invalid-email':
      return 'Invalid email address. Please check and try again.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/user-not-found':
      return 'No account found with this email. Please check and try again.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please try again.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/network-request-failed':
      return "You're offline. Please check your internet connection."
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. Please try again.'

    // Firestore errors
    case 'permission-denied':
      return "You don't have permission to access this data."
    case 'not-found':
      return 'Data not found. Please try again.'
    case 'already-exists':
      return 'This item already exists.'
    case 'resource-exhausted':
      return 'Too many requests. Please try again later.'
    case 'failed-precondition':
      return 'Operation cannot be completed. Please try again.'
    case 'aborted':
      return 'Operation was interrupted. Please try again.'
    case 'out-of-range':
      return 'Invalid data range. Please check your input.'
    case 'unimplemented':
      return 'This feature is not available yet.'
    case 'internal':
      return 'Internal server error. Please try again later.'
    case 'unavailable':
      return 'Service temporarily unavailable. Please try again.'
    case 'data-loss':
      return 'Data corruption detected. Please contact support.'
    case 'unauthenticated':
      return 'Please sign in to continue.'

    // Default Firebase error
    default:
      console.warn(`Unhandled Firebase error code: ${error.code}`)
      return 'An error occurred. Please try again.'
  }
}

/**
 * Check if device is offline
 *
 * @returns boolean - true if offline
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

/**
 * Handle network errors specifically
 *
 * @param context - Context where error occurred
 */
export function handleNetworkError(context: string): void {
  handleError(
    new Error("You're offline. Please check your internet connection."),
    context
  )
}
