'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRoleStore } from '@/stores/roleStore'
import { useBarberStore } from '@/stores/barberStore'
import { ServiceLogForm } from '@/components/features/service-logs/ServiceLogForm'
import { ServiceLogHistory } from '@/components/features/service-logs/ServiceLogHistory'
import { BarberDailyStats } from '@/components/features/service-logs/BarberDailyStats'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function BarberDashboardPage() {
  const router = useRouter()
  const clearRole = useRoleStore((state) => state.clearRole)
  const { selectedBarber, clearSelectedBarber } = useBarberStore()

  useEffect(() => {
    // If no barber is selected, redirect to the login page
    if (!selectedBarber) {
      router.push('/login')
    }
  }, [selectedBarber, router])

  function handleLogout() {
    clearRole()
    clearSelectedBarber()
    router.push('/login')
  }

  if (!selectedBarber) {
    // Render nothing or a loading state while redirecting
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {selectedBarber.username}!
          </h1>
          <p className="text-sm text-gray-400">
            Here is your summary for today.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="bg-transparent border-primary text-primary hover:bg-primary hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Today&apos;s Performance
          </h2>
          <BarberDailyStats barberId={selectedBarber.id} />
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
          <ServiceLogHistory barberId={selectedBarber.id} />
        </div>
      </main>
    </div>
  )
}
