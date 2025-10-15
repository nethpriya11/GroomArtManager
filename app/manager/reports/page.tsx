'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/features/common/Navigation'
import { DailyReportView } from '@/components/features/reports/DailyReportView'
import { DetailedLedger } from '@/components/features/reports/DetailedLedger'
import { useAuthStore } from '@/stores/authStore'

export default function ManagerReportsPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      router.push('/login')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navigation role="manager" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        </div>

        <DailyReportView />

        <div className="mt-8">
          <DetailedLedger />
        </div>
      </main>
    </div>
  )
}
