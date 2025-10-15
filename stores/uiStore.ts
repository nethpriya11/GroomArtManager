import { create } from 'zustand'
import { ReactNode } from 'react'

/**
 * UI state
 */
interface UIState {
  // Modal state
  isModalOpen: boolean
  modalContent: ReactNode | null

  // Loading state
  isLoading: boolean
  loadingMessage: string | null

  // Sidebar state (for mobile)
  isSidebarOpen: boolean
}

/**
 * UI actions
 */
interface UIActions {
  // Modal actions
  openModal: (content: ReactNode) => void
  closeModal: () => void

  // Loading actions
  setLoading: (isLoading: boolean, message?: string) => void

  // Sidebar actions
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
}

/**
 * UI store for managing global UI state
 *
 * Usage:
 * ```tsx
 * const { isModalOpen, openModal, closeModal } = useUIStore()
 * const { isLoading, setLoading } = useUIStore()
 * const { isSidebarOpen, toggleSidebar } = useUIStore()
 * ```
 *
 * Note: Toast notifications use Sonner library and don't require state
 */
export const useUIStore = create<UIState & UIActions>((set) => ({
  // Initial state
  isModalOpen: false,
  modalContent: null,
  isLoading: false,
  loadingMessage: null,
  isSidebarOpen: false,

  // Modal actions
  openModal: (content: ReactNode) =>
    set({
      isModalOpen: true,
      modalContent: content,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      modalContent: null,
    }),

  // Loading actions
  setLoading: (isLoading: boolean, message?: string) =>
    set({
      isLoading,
      loadingMessage: message ?? null,
    }),

  // Sidebar actions
  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  setSidebarOpen: (isOpen: boolean) =>
    set({
      isSidebarOpen: isOpen,
    }),
}))
