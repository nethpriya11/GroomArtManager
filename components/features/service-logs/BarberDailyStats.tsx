'use client'

import { useMemo } from 'react'
import { Loader2, DollarSign, Scissors, TrendingUp } from 'lucide-react'
import { useBarberServiceLogs } from '@/hooks/useServiceLogs'
import { formatCurrency } from '@/lib/utils/formatters'

interface BarberDailyStatsProps {
  barberId: string
}

/**
 * Barber Daily Stats Component
 *
 * Displays today's performance metrics for a barber:
 * - Total services completed today
 * - Total revenue generated today
 * - Total commission earned today
 */
export function BarberDailyStats({ barberId }: BarberDailyStatsProps) {
  const { data: allLogs, isLoading } = useBarberServiceLogs(barberId)

  const stats = useMemo(() => {
    if (!allLogs) {
      return {
        todayServices: 0,
        todayCommission: 0,
        approvedTodayServices: 0,
        approvedTodayCommission: 0,
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayLogs = allLogs.filter((log) => {
      const logDate = log.createdAt.toDate()
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === today.getTime()
    })

    const approvedTodayLogs = todayLogs.filter(
      (log) => log.status === 'approved'
    )

    return {
      todayServices: todayLogs.length,
      todayCommission: todayLogs.reduce(
        (sum, log) => sum + log.commissionAmount,
        0
      ),
      approvedTodayServices: approvedTodayLogs.length,
      approvedTodayCommission: approvedTodayLogs.reduce(
        (sum, log) => sum + log.commissionAmount,
        0
      ),
    }
  }, [allLogs])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Today's Services */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Today&apos;s Services</p>
            <p className="text-2xl font-bold text-white">
              {stats.todayServices}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {stats.approvedTodayServices} approved
        </p>
      </div>

      {/* Today's Commission */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Your Commission</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(stats.todayCommission)}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {formatCurrency(stats.approvedTodayCommission)} approved
        </p>
      </div>
    </div>
  )
}
