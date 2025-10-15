import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '@/stores/uiStore'

describe('uiStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useUIStore.setState({
      isModalOpen: false,
      modalContent: null,
      isLoading: false,
      loadingMessage: null,
      isSidebarOpen: false,
    })
  })

  describe('modal actions', () => {
    it('opens modal with content', () => {
      const content = 'Modal Content'

      useUIStore.getState().openModal(content)

      expect(useUIStore.getState().isModalOpen).toBe(true)
      expect(useUIStore.getState().modalContent).toBe(content)
    })

    it('closes modal and clears content', () => {
      const content = 'Modal Content'

      // Open modal first
      useUIStore.getState().openModal(content)
      expect(useUIStore.getState().isModalOpen).toBe(true)

      // Close modal
      useUIStore.getState().closeModal()

      expect(useUIStore.getState().isModalOpen).toBe(false)
      expect(useUIStore.getState().modalContent).toBeNull()
    })
  })

  describe('loading actions', () => {
    it('sets loading state with message', () => {
      useUIStore.getState().setLoading(true, 'Processing...')

      expect(useUIStore.getState().isLoading).toBe(true)
      expect(useUIStore.getState().loadingMessage).toBe('Processing...')
    })

    it('sets loading state without message', () => {
      useUIStore.getState().setLoading(true)

      expect(useUIStore.getState().isLoading).toBe(true)
      expect(useUIStore.getState().loadingMessage).toBeNull()
    })

    it('clears loading state', () => {
      // Set loading first
      useUIStore.getState().setLoading(true, 'Loading...')

      // Clear loading
      useUIStore.getState().setLoading(false)

      expect(useUIStore.getState().isLoading).toBe(false)
      expect(useUIStore.getState().loadingMessage).toBeNull()
    })
  })

  describe('sidebar actions', () => {
    it('toggles sidebar from closed to open', () => {
      expect(useUIStore.getState().isSidebarOpen).toBe(false)

      useUIStore.getState().toggleSidebar()

      expect(useUIStore.getState().isSidebarOpen).toBe(true)
    })

    it('toggles sidebar from open to closed', () => {
      // Open sidebar first
      useUIStore.setState({ isSidebarOpen: true })

      useUIStore.getState().toggleSidebar()

      expect(useUIStore.getState().isSidebarOpen).toBe(false)
    })

    it('sets sidebar open directly', () => {
      useUIStore.getState().setSidebarOpen(true)

      expect(useUIStore.getState().isSidebarOpen).toBe(true)
    })

    it('sets sidebar closed directly', () => {
      // Open sidebar first
      useUIStore.setState({ isSidebarOpen: true })

      useUIStore.getState().setSidebarOpen(false)

      expect(useUIStore.getState().isSidebarOpen).toBe(false)
    })
  })
})
