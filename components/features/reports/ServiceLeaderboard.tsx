'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Loader2 } from 'lucide-react'
import { useServiceLogs } from '@/hooks/useServiceLogs'
import { useServices } from '@/hooks/useServices'
import { formatCurrency } from '@/lib/utils/formatters'

/**
 * Service Leaderboard Component
 *
 * Ranks services by popularity and revenue from approved logs:
 * - Total times service was performed
 * - Total revenue generated
 * - Average price
 *
 * Sorted by total count (descending)
 */
export function ServiceLeaderboard() {
  const { data: approvedLogs, isLoading: logsLoading } =
    useServiceLogs('approved')
  const { data: services, isLoading: servicesLoading } = useServices()

  const leaderboard = useMemo(() => {
    if (!approvedLogs || !services) return []

    const serviceStats = new Map<
      string,
      {
        serviceId: string
        serviceName: string
        count: number
        totalRevenue: number
        avgPrice: number
      }
    >()

    // Aggregate stats for each service
    approvedLogs.forEach((log) => {
      const existing = serviceStats.get(log.serviceId) || {
        serviceId: log.serviceId,
        serviceName:
          services.find((s) => s.id === log.serviceId)?.name || 'Unknown',
        count: 0,
        totalRevenue: 0,
        avgPrice: 0,
      }

      existing.count += 1
      existing.totalRevenue += log.price

      serviceStats.set(log.serviceId, existing)
    })

    // Calculate average and sort by count
    return Array.from(serviceStats.values())
      .map((stats) => ({
        ...stats,
        avgPrice: stats.totalRevenue / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [approvedLogs, services])

  const isLoading = logsLoading || servicesLoading

  const getRankBadge = (rank: number) => {
    const colors = [
      'bg-primary/10 text-primary border-primary/20',
      'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'bg-green-500/10 text-green-500 border-green-500/20',
      'bg-purple-500/10 text-purple-500 border-purple-500/20',
    ]
    return colors[rank - 1] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Star className="h-5 w-5 text-primary" />
          Service Leaderboard
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
          <div className="space-y-3">
            {leaderboard.map((stats, index) => (
              <div
                key={stats.serviceId}
                className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold border ${getRankBadge(
                      index + 1
                    )}`}
                  >
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">
                      {stats.serviceName}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Avg: {formatCurrency(stats.avgPrice)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{stats.count}</p>
                  <p className="text-xs text-gray-400">services</p>
                  <p className="text-sm text-primary mt-1">
                    {formatCurrency(stats.totalRevenue)}
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
