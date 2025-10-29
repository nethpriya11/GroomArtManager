import { create } from 'zustand'
import { UserRole } from '@/types/firestore'

/**
 * Role state
 */
interface RoleState {
  role: UserRole | null
}

/**
 * Role actions
 */
interface RoleActions {
  setRole: (role: UserRole) => void
  clearRole: () => void
}

/**
 * Role store for managing user role
 *
 * Usage:
 * ```tsx
 * const { role, setRole, clearRole } = useRoleStore()
 * ```
 */
export const useRoleStore = create<RoleState & RoleActions>((set) => ({
  // Initial state
  role: null,

  // Actions
  setRole: (role: UserRole) =>
    set({
      role,
    }),

  clearRole: () =>
    set({
      role: null,
    }),
}))
