'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/features/common/Navigation'
import { DashboardKPIs } from '@/components/features/dashboard/DashboardKPIs'
import { PendingApprovalsTable } from '@/components/features/dashboard/PendingApprovalsTable'
import { ManagerServiceLogForm } from '@/components/features/service-logs/ManagerServiceLogForm'
import { useAuthStore } from '@/stores/authStore'

/**
 * Manager Dashboard Page
 *
 * Main dashboard for managers with:
 * - Navigation bar with links to Barbers, Services, Approvals, Reports
 * - Real-time KPI cards showing key metrics
 * - Pending approvals table preview
 *
 * Route protection: Only accessible to authenticated users with role='manager'
 */
export default function ManagerDashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)

  // Client-side auth protection
  useEffect(() => {
    if (!user || role !== 'manager') {
      router.push('/login')
    }
  }, [user, role, router])

  // Show loading state while checking auth
  if (!user || role !== 'manager') {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <Navigation role="manager" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-400">
            Here&apos;s what&apos;s happening with your salon today.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="mb-8">
          <DashboardKPIs />
        </div>

        {/* Manager Service Logging Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">
              Log Services for Barbers
            </h2>
            <p className="text-gray-400">
              Log services on behalf of barbers when they&apos;re busy. Services
              will be automatically approved.
            </p>
          </div>
          <ManagerServiceLogForm />
        </div>

        {/* Pending Approvals Section */}
        <div className="mb-8">
          <PendingApprovalsTable />
        </div>
      </main>
    </div>
  )
}
