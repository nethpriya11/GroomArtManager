'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { useBarberServiceLogs } from '@/hooks/useServiceLogs'
import { useServices } from '@/hooks/useServices'
import { deleteServiceLog } from '@/lib/firebase/repositories/service-log-repository'
import { formatCurrency } from '@/lib/utils/formatters'
import type { ServiceLog, ServiceLogStatus } from '@/types/firestore'

interface ServiceLogHistoryProps {
  barberId: string
}

/**
 * Service Log History Component
 *
 * Displays a barber's service log history with filtering by status.
 * Allows deletion of pending logs.
 */
export function ServiceLogHistory({ barberId }: ServiceLogHistoryProps) {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<ServiceLogStatus | 'all'>(
    'all'
  )

  const {
    data: logs,
    isLoading,
    error,
  } = useBarberServiceLogs(
    barberId,
    statusFilter === 'all' ? undefined : statusFilter
  )
  const { data: services } = useServices()

  const deleteLogMutation = useMutation({
    mutationFn: deleteServiceLog,
    onMutate: async (logId) => {
      await queryClient.cancelQueries({ queryKey: ['serviceLogs'] })
      const previousLogs = queryClient.getQueryData([
        'serviceLogs',
        'barber',
        barberId,
      ])

      queryClient.setQueryData(
        ['serviceLogs', 'barber', barberId],
        (old: any) => {
          if (!old) return []
          return old.filter((log: ServiceLog) => log.id !== logId)
        }
      )

      return { previousLogs }
    },
    onError: (error, logId, context) => {
      queryClient.setQueryData(
        ['serviceLogs', 'barber', barberId],
        context?.previousLogs
      )
      console.error('Service log deletion error:', error)
      toast.error('Failed to delete log. Please try again.')
    },
    onSuccess: () => {
      toast.success('Log deleted successfully!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceLogs'] })
    },
  })

  const getServiceName = (serviceId: string) => {
    const service = services?.find((s) => s.id === serviceId)
    return service?.name || 'Unknown Service'
  }

  const handleDeleteLog = (logId: string) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      deleteLogMutation.mutate(logId)
    }
  }

  const getStatusBadge = (status: ServiceLogStatus) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      approved: 'bg-green-500/10 text-green-500 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    }

    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    }

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium border ${styles[status]}`}
      >
        {labels[status]}
      </span>
    )
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading logs. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`
              px-4 py-2 rounded-t text-sm font-medium transition-colors
              ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }
            `}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Service Logs List */}
      {!logs || logs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {statusFilter === 'all'
              ? 'No service logs yet. Log your first service above.'
              : `No ${statusFilter} logs.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-white">
                      {getServiceName(log.serviceId)}
                    </h4>
                    {getStatusBadge(log.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-400">
                    <div>
                      <span className="text-gray-500">Price:</span>{' '}
                      {formatCurrency(log.price)}
                    </div>
                    <div>
                      <span className="text-gray-500">Commission:</span>{' '}
                      {formatCurrency(log.commissionAmount)}
                    </div>
                    <div>
                      <span className="text-gray-500">Rate:</span>{' '}
                      {(log.commissionRate * 100).toFixed(0)}%
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>{' '}
                      {formatDate(log.createdAt)}
                    </div>
                  </div>

                  {log.approvedAt && (
                    <p className="text-xs text-green-500">
                      Approved: {formatDate(log.approvedAt)}
                    </p>
                  )}
                  {log.rejectedAt && (
                    <p className="text-xs text-red-500">
                      Rejected: {formatDate(log.rejectedAt)}
                    </p>
                  )}
                </div>

                {/* Delete Button (only for pending logs) */}
                {log.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => handleDeleteLog(log.id)}
                    aria-label="Delete log"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
