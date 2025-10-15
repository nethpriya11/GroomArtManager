'use client'

import { useMemo } from 'react'
import { DollarSign, Scissors, Users, Clock } from 'lucide-react'
import { KPICard } from './KPICard'
import { useServiceLogs } from '@/hooks/useServiceLogs'
import { useBarbers } from '@/hooks/useBarbers'
import { formatCurrency } from '@/lib/utils/formatters'

/**
 * Dashboard KPIs Component
 *
 * Displays real-time aggregate KPIs for the manager dashboard:
 * - Total Revenue (approved services)
 * - Total Services (all statuses)
 * - Active Barbers count
 * - Pending Approvals count
 */
export function DashboardKPIs() {
  const { data: allLogs, isLoading: logsLoading } = useServiceLogs()
  const { data: barbers, isLoading: barbersLoading } = useBarbers()
  const { data: pendingLogs } = useServiceLogs('pending')
  const { data: approvedLogs } = useServiceLogs('approved')

  const metrics = useMemo(() => {
    if (!allLogs || !approvedLogs) {
      return {
        totalRevenue: 0,
        totalServices: 0,
        activeBarbers: 0,
        pendingApprovals: 0,
      }
    }

    return {
      totalRevenue: approvedLogs.reduce((sum, log) => sum + log.price, 0),
      totalServices: allLogs.length,
      activeBarbers: barbers?.length || 0,
      pendingApprovals: pendingLogs?.length || 0,
    }
  }, [allLogs, approvedLogs, barbers, pendingLogs])

  const isLoading = logsLoading || barbersLoading

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total Revenue"
        value={isLoading ? '...' : formatCurrency(metrics.totalRevenue)}
        icon={DollarSign}
        subtitle="Approved services only"
      />
      <KPICard
        title="Total Services"
        value={isLoading ? '...' : metrics.totalServices}
        icon={Scissors}
        subtitle="All time"
      />
      <KPICard
        title="Active Barbers"
        value={isLoading ? '...' : metrics.activeBarbers}
        icon={Users}
        subtitle="Currently registered"
      />
      <KPICard
        title="Pending Approvals"
        value={isLoading ? '...' : metrics.pendingApprovals}
        icon={Clock}
        subtitle="Awaiting review"
      />
    </div>
  )
}
