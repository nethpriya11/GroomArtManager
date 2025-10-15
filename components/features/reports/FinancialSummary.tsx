'use client'

import { useMemo } from 'react'
import { DollarSign, TrendingUp, Users, Scissors } from 'lucide-react'
import { KPICard } from '../dashboard/KPICard'
import { useServiceLogs } from '@/hooks/useServiceLogs'
import { formatCurrency } from '@/lib/utils/formatters'

/**
 * Financial Summary Component
 *
 * Displays aggregate financial KPIs for approved service logs:
 * - Total Revenue (sum of approved log prices)
 * - Total Commission (sum of approved log commissions)
 * - Average Service Price
 * - Total Services (count of approved logs)
 */
export function FinancialSummary() {
  const { data: approvedLogs, isLoading } = useServiceLogs('approved')

  const metrics = useMemo(() => {
    if (!approvedLogs || approvedLogs.length === 0) {
      return {
        totalRevenue: 0,
        totalCommission: 0,
        avgServicePrice: 0,
        totalServices: 0,
      }
    }

    const totalRevenue = approvedLogs.reduce((sum, log) => sum + log.price, 0)
    const totalCommission = approvedLogs.reduce(
      (sum, log) => sum + log.commissionAmount,
      0
    )

    return {
      totalRevenue,
      totalCommission,
      avgServicePrice: totalRevenue / approvedLogs.length,
      totalServices: approvedLogs.length,
    }
  }, [approvedLogs])

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">
        Financial Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={isLoading ? '...' : formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          subtitle="Approved services only"
        />
        <KPICard
          title="Total Commission"
          value={isLoading ? '...' : formatCurrency(metrics.totalCommission)}
          icon={TrendingUp}
          subtitle="Paid to barbers"
        />
        <KPICard
          title="Avg Service Price"
          value={isLoading ? '...' : formatCurrency(metrics.avgServicePrice)}
          icon={DollarSign}
          subtitle="Per service"
        />
        <KPICard
          title="Total Services"
          value={isLoading ? '...' : metrics.totalServices}
          icon={Scissors}
          subtitle="Approved"
        />
      </div>
    </div>
  )
}
