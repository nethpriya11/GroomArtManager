'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { LogOut, Scissors, BookOpen, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useAuthStore } from '@/stores/authStore'

import { signOut } from '@/lib/services/auth'

import { handleError } from '@/lib/utils/error-handler'

import { toast } from 'sonner'

import { ServiceLogForm } from '@/components/features/service-logs/ServiceLogForm'

import { ServiceLogHistory } from '@/components/features/service-logs/ServiceLogHistory'

import { BarberDailyStats } from '@/components/features/service-logs/BarberDailyStats'

export default function BarberDashboardPage() {
  const router = useRouter()

  const user = useAuthStore((state) => state.user)

  const role = useAuthStore((state) => state.role)

  const logout = useAuthStore((state) => state.logout)

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await signOut()

      logout()

      toast.success('Logged out successfully')

      router.push('/login')
    } catch (error) {
      handleError(error, 'Navigation.handleLogout')
    } finally {
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    if (!user || role !== 'barber') {
      router.push('/login')
    }
  }, [user, role, router])

  if (!user || role !== 'barber') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.username}!</h1>

          <p className="text-sm text-gray-400">
            Here is your summary for today.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="bg-transparent border-primary text-primary hover:bg-primary hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />

          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Today&apos;s Performance
          </h2>
          <BarberDailyStats barberId={user.id} />
        </div>

        {/* Log Services */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Log Services
          </h2>
          <ServiceLogForm />
        </div>

        {/* Service History */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Service History
          </h2>
          <ServiceLogHistory barberId={user.id} />
        </div>
      </main>
    </div>
  )
}
