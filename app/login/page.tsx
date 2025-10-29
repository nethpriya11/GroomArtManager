'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BarberProfileSelection } from '@/components/features/auth/BarberProfileSelection'
import { useRoleStore } from '@/stores/roleStore'

/**
 * Login page for role selection
 *
 * Users select whether they are a Manager or Barber.
 * - Manager: Navigates to the manager dashboard.
 * - Barber: Shows barber selection view to choose a specific barber profile.
 */
export default function LoginPage() {
  const router = useRouter()
  const setRole = useRoleStore((state) => state.setRole)
  const [view, setView] = useState<'role-selection' | 'barber-selection'>(
    'role-selection'
  )

  /**
   * Handle Manager button click
   *
   * Navigates to the manager dashboard.
   */
  function handleManagerClick() {
    setRole('manager')
    router.push('/manager/dashboard')
  }

  /**
   * Handle Barber button click
   *
   * Navigate to barber selection view.
   */
  function handleBarberClick() {
    setView('barber-selection')
  }

  /**
   * Handle back button click
   *
   * Return to role selection view.
   */
  function handleBackClick() {
    setView('role-selection')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-10">
        {/* Branding */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white animate-fade-in-down">
            SalonFlow
          </h1>
          <p className="text-gray-400 text-lg">
            Commission Tracking Made Simple
          </p>
        </div>

        {view === 'role-selection' ? (
          /* Role Selection View */
          <div className="space-y-6">
            {/* Manager Button */}
            <Button
              className="w-full h-16 text-lg bg-gray-800/50 border-gray-700 hover:bg-primary/80 hover:text-white transition-all duration-300 transform hover:scale-105"
              variant="outline"
              size="lg"
              onClick={handleManagerClick}
              aria-label="Continue as Manager"
            >
              <div className="flex items-center gap-3">
                <User className="h-6 w-6" />
                <span>Manager</span>
              </div>
            </Button>

            {/* Barber Button */}
            <Button
              className="w-full h-16 text-lg bg-gray-800/50 border-gray-700 hover:bg-primary/80 hover:text-white transition-all duration-300 transform hover:scale-105"
              variant="outline"
              size="lg"
              onClick={handleBarberClick}
              aria-label="Continue as Barber"
            >
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                <span>Barber</span>
              </div>
            </Button>
          </div>
        ) : (
          /* Barber Selection View */
          <BarberProfileSelection onBack={handleBackClick} />
        )}

        {/* Footer Text */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Tap your role to continue</p>
        </div>
      </div>
    </div>
  )
}
