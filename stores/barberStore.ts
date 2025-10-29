import { create } from 'zustand'
import { UserProfile } from '@/types/firestore'

/**
 * Barber state
 */
interface BarberState {
  selectedBarber: UserProfile | null
}

/**
 * Barber actions
 */
interface BarberActions {
  setSelectedBarber: (barber: UserProfile) => void
  clearSelectedBarber: () => void
}

/**
 * Barber store for managing the selected barber
 *
 * Usage:
 * ```tsx
 * const { selectedBarber, setSelectedBarber } = useBarberStore()
 * ```
 */
export const useBarberStore = create<BarberState & BarberActions>((set) => ({
  // Initial state
  selectedBarber: null,

  // Actions
  setSelectedBarber: (barber: UserProfile) =>
    set({
      selectedBarber: barber,
    }),

  clearSelectedBarber: () =>
    set({
      selectedBarber: null,
    }),
}))
