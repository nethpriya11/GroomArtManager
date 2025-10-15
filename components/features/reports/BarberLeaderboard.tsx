'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Loader2 } from 'lucide-react'
import { useServiceLogs } from '@/hooks/useServiceLogs'
import { useBarbers } from '@/hooks/useBarbers'
import { formatCurrency } from '@/lib/utils/formatters'

/**
 * Barber Leaderboard Component
 *
 * Ranks barbers by performance metrics from approved service logs:
 * - Total revenue generated
 * - Total services completed
 * - Total commission earned
 * - Average service price
 *
 * Sorted by total revenue (descending)
 */
export function BarberLeaderboard() {
  const { data: approvedLogs, isLoading: logsLoading } =
    useServiceLogs('approved')
  const { data: barbers, isLoading: barbersLoading } = useBarbers()

  const leaderboard = useMemo(() => {
    if (!approvedLogs || !barbers) return []

    const barberStats = new Map<
      string,
      {
        barberId: string
        barberName: string
        totalRevenue: number
        totalServices: number
        totalCommission: number
        avgServicePrice: number
      }
    >()

    // Aggregate stats for each barber
    approvedLogs.forEach((log) => {
      const existing = barberStats.get(log.barberId) || {
        barberId: log.barberId,
        barberName:
          barbers.find((b) => b.id === log.barberId)?.username || 'Unknown',
        totalRevenue: 0,
        totalServices: 0,
        totalCommission: 0,
        avgServicePrice: 0,
      }

      existing.totalRevenue += log.price
      existing.totalServices += 1
      existing.totalCommission += log.commissionAmount

      barberStats.set(log.barberId, existing)
    })

    // Calculate average and sort by revenue
    return Array.from(barberStats.values())
      .map((stats) => ({
        ...stats,
        avgServicePrice: stats.totalRevenue / stats.totalServices,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
  }, [approvedLogs, barbers])

  const isLoading = logsLoading || barbersLoading

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}.`
  }

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Trophy className="h-5 w-5 text-primary" />
          Barber Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No data available yet. Start logging services!
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((stats, index) => (
              <div
                key={stats.barberId}
                className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-2xl font-bold text-white w-12 text-center">
                    {getMedalEmoji(index + 1)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">
                      {stats.barberName}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-400 mt-1">
                      <span>{stats.totalServices} services</span>
                      <span>Avg: {formatCurrency(stats.avgServicePrice)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  <p className="text-xs text-primary">
                    Commission: {formatCurrency(stats.totalCommission)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
