'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BookOpen, Search, Loader2, ArrowUpDown } from 'lucide-react'
import { useServiceLogs } from '@/hooks/useServiceLogs'
import { useBarbers } from '@/hooks/useBarbers'
import { useServices } from '@/hooks/useServices'
import { formatCurrency } from '@/lib/utils/formatters'
import type { ServiceLog, ServiceLogStatus } from '@/types/firestore'

type SortField =
  | 'date'
  | 'barber'
  | 'service'
  | 'price'
  | 'commission'
  | 'status'
type SortOrder = 'asc' | 'desc'

/**
 * Detailed Ledger Component
 *
 * Displays a searchable, sortable table of all service logs.
 *
 * Features:
 * - Search by barber name, service name, or log ID
 * - Filter by status (all/pending/approved/rejected)
 * - Sort by any column
 * - Shows all relevant details (date, barber, service, price, commission, status)
 */
export function DetailedLedger() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceLogStatus>(
    'all'
  )
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const { data: allLogs, isLoading: logsLoading } = useServiceLogs(
    statusFilter === 'all' ? undefined : statusFilter
  )
  const { data: barbers } = useBarbers()
  const { data: services } = useServices()

  const getBarberName = useCallback(
    (barberId: string) => {
      const barber = barbers?.find((b) => b.id === barberId)
      return barber?.username || 'Unknown Barber'
    },
    [barbers]
  )

  const getServiceName = useCallback(
    (serviceId: string) => {
      const service = services?.find((s) => s.id === serviceId)
      return service?.name || 'Unknown Service'
    },
    [services]
  )

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

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    if (!allLogs) return []

    let filtered = allLogs

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((log) => {
        const barberName = getBarberName(log.barberId).toLowerCase()
        const serviceName = getServiceName(log.serviceId).toLowerCase()
        const logId = log.id.toLowerCase()

        return (
          barberName.includes(query) ||
          serviceName.includes(query) ||
          logId.includes(query)
        )
      })
    }

    // Apply sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'date': {
          const dateA = a.createdAt.toDate ? a.createdAt.toDate().getTime() : 0
          const dateB = b.createdAt.toDate ? b.createdAt.toDate().getTime() : 0
          comparison = dateA - dateB
          break
        }
        case 'barber':
          comparison = getBarberName(a.barberId).localeCompare(
            getBarberName(b.barberId)
          )
          break
        case 'service':
          comparison = getServiceName(a.serviceId).localeCompare(
            getServiceName(b.serviceId)
          )
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'commission':
          comparison = a.commissionAmount - b.commissionAmount
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [
    allLogs,
    searchQuery,
    sortField,
    sortOrder,
    getBarberName,
    getServiceName,
  ])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField
    label: string
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-white transition-colors"
    >
      {label}
      {sortField === field && (
        <ArrowUpDown
          className={`h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
        />
      )}
    </button>
  )

  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <BookOpen className="h-5 w-5 text-primary" />
            Detailed Ledger
          </CardTitle>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search barber, service, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0a0a0a] border-gray-800 text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-1 border border-gray-800 rounded-md p-1 bg-[#0a0a0a]">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`
                    px-3 py-1 rounded text-xs font-medium transition-colors
                    ${
                      statusFilter === status
                        ? 'bg-primary text-white'
                        : 'text-gray-400 hover:text-white'
                    }
                  `}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {logsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'No matching logs found'
              : 'No service logs yet. Start logging services!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">
                    <SortButton field="date" label="Date" />
                  </TableHead>
                  <TableHead className="text-gray-400">
                    <SortButton field="barber" label="Barber" />
                  </TableHead>
                  <TableHead className="text-gray-400">
                    <SortButton field="service" label="Service" />
                  </TableHead>
                  <TableHead className="text-gray-400 text-right">
                    <SortButton field="price" label="Price" />
                  </TableHead>
                  <TableHead className="text-gray-400 text-right">
                    <SortButton field="commission" label="Commission" />
                  </TableHead>
                  <TableHead className="text-gray-400">
                    <SortButton field="status" label="Status" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-gray-800 hover:bg-gray-900/50 transition-colors"
                  >
                    <TableCell className="text-gray-400 text-sm">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {getBarberName(log.barberId)}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {getServiceName(log.serviceId)}
                    </TableCell>
                    <TableCell className="text-gray-400 text-right">
                      {formatCurrency(log.price)}
                    </TableCell>
                    <TableCell className="text-primary text-right font-medium">
                      {formatCurrency(log.commissionAmount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {filteredLogs.length}{' '}
              {filteredLogs.length === 1 ? 'log' : 'logs'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
