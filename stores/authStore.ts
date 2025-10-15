import { create } from 'zustand'
import { UserProfile, UserRole } from '@/types/firestore'

/**
 * Authentication state
 */
interface AuthState {
  user: UserProfile | null
  role: UserRole | null
}

/**
 * Authentication actions
 */
interface AuthActions {
  login: (user: UserProfile) => void
  logout: () => void
  updateUser: (updates: Partial<UserProfile>) => void
}

/**
 * Authentication store for managing user session and role
 *
 * Usage:
 * ```tsx
 * const { user, role, login, logout } = useAuthStore()
 * ```
 */
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // Initial state
  user: null,
  role: null,

  // Actions
  login: (user: UserProfile) =>
    set({
      user,
      role: user.role,
    }),

  logout: () =>
    set({
      user: null,
      role: null,
    }),

  updateUser: (updates: Partial<UserProfile>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}))
