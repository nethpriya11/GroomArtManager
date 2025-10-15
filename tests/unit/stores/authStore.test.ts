import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { UserProfile } from '@/types/firestore'
import { Timestamp } from 'firebase/firestore'

describe('authStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useAuthStore.setState({ user: null, role: null })
  })

  describe('login', () => {
    it('sets user and role when logging in', () => {
      const mockUser: UserProfile = {
        id: 'user_123',
        username: 'Test Manager',
        role: 'manager',
        avatarUrl: null,
        commissionRate: 0,
        createdAt: Timestamp.now(),
      }

      useAuthStore.getState().login(mockUser)

      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().role).toBe('manager')
    })

    it('handles barber login correctly', () => {
      const mockBarber: UserProfile = {
        id: 'barber_456',
        username: 'Test Barber',
        role: 'barber',
        avatarUrl: null,
        commissionRate: 0.45,
        createdAt: Timestamp.now(),
      }

      useAuthStore.getState().login(mockBarber)

      expect(useAuthStore.getState().user).toEqual(mockBarber)
      expect(useAuthStore.getState().role).toBe('barber')
    })
  })

  describe('logout', () => {
    it('clears user and role when logging out', () => {
      const mockUser: UserProfile = {
        id: 'user_123',
        username: 'Test User',
        role: 'manager',
        avatarUrl: null,
        commissionRate: 0,
        createdAt: Timestamp.now(),
      }

      // Login first
      useAuthStore.getState().login(mockUser)
      expect(useAuthStore.getState().user).not.toBeNull()

      // Then logout
      useAuthStore.getState().logout()

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().role).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('updates user properties', () => {
      const mockUser: UserProfile = {
        id: 'user_123',
        username: 'Test User',
        role: 'barber',
        avatarUrl: null,
        commissionRate: 0.4,
        createdAt: Timestamp.now(),
      }

      // Login first
      useAuthStore.getState().login(mockUser)

      // Update username and commission rate
      useAuthStore.getState().updateUser({
        username: 'Updated Name',
        commissionRate: 0.5,
      })

      const updatedUser = useAuthStore.getState().user
      expect(updatedUser).not.toBeNull()
      expect(updatedUser?.username).toBe('Updated Name')
      expect(updatedUser?.commissionRate).toBe(0.5)
      expect(updatedUser?.id).toBe('user_123') // Other fields unchanged
    })

    it('handles null user gracefully', () => {
      // No user logged in
      useAuthStore.getState().updateUser({
        username: 'Should not apply',
      })

      expect(useAuthStore.getState().user).toBeNull()
    })

    it('updates avatar URL', () => {
      const mockUser: UserProfile = {
        id: 'user_123',
        username: 'Test User',
        role: 'barber',
        avatarUrl: null,
        commissionRate: 0.4,
        createdAt: Timestamp.now(),
      }

      useAuthStore.getState().login(mockUser)
      useAuthStore.getState().updateUser({
        avatarUrl: 'https://example.com/avatar.jpg',
      })

      expect(useAuthStore.getState().user?.avatarUrl).toBe(
        'https://example.com/avatar.jpg'
      )
    })
  })
})
