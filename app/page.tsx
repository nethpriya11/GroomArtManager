'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogIn, Scissors } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (user && role) {
      if (role === 'manager') {
        router.push('/manager/dashboard')
      } else if (role === 'barber') {
        router.push('/barber/dashboard')
      }
    }
  }, [user, role, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#0a0a0a]">
      <div className="text-center space-y-6">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Scissors className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-white">SalonFlow</h1>
        <p className="text-xl text-gray-400">Commission Tracking Made Simple</p>

        {/* Description */}
        <p className="text-gray-500 max-w-md mx-auto">
          Streamline your salon operations with real-time service logging,
          commission tracking, and comprehensive analytics.
        </p>

        {/* Login Button */}
        <div className="pt-8">
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg">
              <LogIn className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl">
          <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">
              Service Logging
            </h3>
            <p className="text-sm text-gray-400">
              Quick and easy service tracking for barbers
            </p>
          </div>
          <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">
              Real-time Analytics
            </h3>
            <p className="text-sm text-gray-400">
              Live insights into salon performance
            </p>
          </div>
          <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">
              Commission Management
            </h3>
            <p className="text-sm text-gray-400">
              Automatic commission calculation and tracking
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
