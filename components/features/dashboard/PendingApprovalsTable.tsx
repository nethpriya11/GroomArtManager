'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ClipboardList, Loader2, Check, X } from 'lucide-react'
import { usePendingServiceLogs } from '@/hooks/useServiceLogs'
import { useBarbers } from '@/hooks/useBarbers'
import { useServices } from '@/hooks/useServices'
import { formatCurrency } from '@/lib/utils/formatters'
import {
  approveServiceLog,
  rejectServiceLog,
} from '@/lib/firebase/repositories/service-log-repository'
import type { ServiceLog } from '@/types/firestore'

/**
 * Pending Approvals Table Component
 *
 * Displays a preview of pending service log approvals on the dashboard.
 * Shows up to 5 recent pending logs with inline approve/reject actions.
 *
 * Features:
 * - Real-time data from Firestore
 * - Inline approve/reject actions
 * - Optimistic UI updates
 * - Shows barber name, service name, price, and date
 * - Link to full approvals page
 * - Dark theme styling
 */
export function PendingApprovalsTable() {
  const queryClient = useQueryClient()
  const { data: pendingLogs, isLoading } = usePendingServiceLogs()
  const { data: barbers } = useBarbers()
  const { data: services } = useServices()

  // Approve mutation with optimistic updates
  const approveLogMutation = useMutation({
    mutationFn: approveServiceLog,
    onMutate: async (logId) => {
      await queryClient.cancelQueries({ queryKey: ['serviceLogs'] })
      const previousLogs = queryClient.getQueryData(['serviceLogs', 'pending'])

      queryClient.setQueryData(['serviceLogs', 'pending'], (old: any) => {
        if (!old) return []
        return old.filter((log: ServiceLog) => log.id !== logId)
      })

      return { previousLogs }
    },
    onError: (error, logId, context) => {
      queryClient.setQueryData(
        ['serviceLogs', 'pending'],
        context?.previousLogs
      )
      console.error('Service log approval error:', error)
      toast.error('Failed to approve log. Please try again.')
    },
    onSuccess: () => {
      toast.success('Service log approved!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceLogs'] })
    },
  })

  // Reject mutation with optimistic updates
  const rejectLogMutation = useMutation({
    mutationFn: rejectServiceLog,
    onMutate: async (logId) => {
      await queryClient.cancelQueries({ queryKey: ['serviceLogs'] })
      const previousLogs = queryClient.getQueryData(['serviceLogs', 'pending'])

      queryClient.setQueryData(['serviceLogs', 'pending'], (old: any) => {
        if (!old) return []
        return old.filter((log: ServiceLog) => log.id !== logId)
      })

      return { previousLogs }
    },
    onError: (error, logId, context) => {
      queryClient.setQueryData(
        ['serviceLogs', 'pending'],
        context?.previousLogs
      )
      console.error('Service log rejection error:', error)
      toast.error('Failed to reject log. Please try again.')
    },
    onSuccess: () => {
      toast.success('Service log rejected.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceLogs'] })
    },
  })

  const getBarberName = (barberId: string) => {
    const barber = barbers?.find((b) => b.id === barberId)
    return barber?.username || 'Unknown Barber'
  }

  const getServiceName = (serviceId: string) => {
    const service = services?.find((s) => s.id === serviceId)
    return service?.name || 'Unknown Service'
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleApprove = (logId: string) => {
    approveLogMutation.mutate(logId)
  }

  const handleReject = (logId: string) => {
    if (window.confirm('Are you sure you want to reject this service log?')) {
      rejectLogMutation.mutate(logId)
    }
  }

  const previewLogs = pendingLogs?.slice(0, 5) || []
  const isPending = approveLogMutation.isPending || rejectLogMutation.isPending

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ClipboardList className="h-5 w-5 text-primary" />
          Pending Approvals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Barber</TableHead>
                <TableHead className="text-gray-400">Service</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewLogs.length === 0 ? (
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No pending approvals
                  </TableCell>
                </TableRow>
              ) : (
                previewLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-gray-800 hover:bg-gray-900/50 transition-colors"
                  >
                    <TableCell className="text-white">
                      {getBarberName(log.barberId)}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {getServiceName(log.serviceId)}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {formatCurrency(log.price)}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(log.id)}
                          disabled={isPending}
                          className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(log.id)}
                          disabled={isPending}
                          className="h-8 px-3"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
