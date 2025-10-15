'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import {
  generateAndSaveDailyReport,
  getDailyReportByDate,
} from '@/lib/firebase/repositories/daily-report-repository'
import { formatCurrency } from '@/lib/utils/formatters'
import type { DailyReport } from '@/types/firestore'

/**
 * Daily Report View Component
 *
 * Allows managers to generate end-of-day reports with:
 * - Total revenue
 * - Each barber's revenue and commission
 * - Manager's commission (50% of profit)
 * - Owner's cut (50% of profit)
 */
export function DailyReportView() {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]!
  )

  // Fetch existing report for the selected date
  const { data: existingReport, isLoading: isLoadingReport } = useQuery({
    queryKey: ['dailyReport', selectedDate],
    queryFn: async () => {
      const reportDate = new Date(selectedDate)
      return await getDailyReportByDate(reportDate)
    },
    enabled: !!selectedDate,
  })

  const generateReportMutation = useMutation({
    mutationFn: async (date: string) => {
      const reportDate = new Date(date)
      return await generateAndSaveDailyReport(reportDate)
    },
    onSuccess: (data) => {
      toast.success(
        existingReport
          ? 'Daily report regenerated successfully!'
          : 'Daily report generated successfully!'
      )
      queryClient.invalidateQueries({ queryKey: ['dailyReport', selectedDate] })
      queryClient.invalidateQueries({ queryKey: ['dailyReports'] })
    },
    onError: (error) => {
      console.error('Report generation error:', error)
      toast.error('Failed to generate report. Please try again.')
    },
  })

  const handleGenerateReport = () => {
    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }
    generateReportMutation.mutate(selectedDate)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Date Selection and Generate Button */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">
          Generate End-of-Day Report
        </h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="reportDate" className="text-white">
              Select Date
            </Label>
            <Input
              id="reportDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="bg-[#0a0a0a] border-gray-800 text-white"
            />
          </div>
          <Button
            onClick={handleGenerateReport}
            disabled={
              generateReportMutation.isPending ||
              isLoadingReport ||
              !selectedDate
            }
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {generateReportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {existingReport ? 'Regenerating...' : 'Generating...'}
              </>
            ) : isLoadingReport ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : existingReport ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Report
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generated Report Display */}
      {existingReport && (
        <div className="space-y-6">
          {/* Report Header */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white">
                Daily Report - {formatDate(selectedDate)}
              </h2>
              <span className="text-sm text-gray-400">
                {existingReport.approvedServiceCount} services completed
              </span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-400">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(existingReport.totalRevenue)}
              </p>
            </div>

            {/* Total Barber Commissions */}
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-sm text-gray-400">Barber Commissions</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(existingReport.totalBarberCommissions)}
              </p>
            </div>

            {/* Manager Commission */}
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-sm text-gray-400">Manager Commission</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(existingReport.managerCommission)}
              </p>
              <p className="text-xs text-gray-500 mt-1">50% of profit</p>
            </div>

            {/* Owner's Cut */}
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-primary">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-gray-400">Owner&apos;s Cut</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(existingReport.ownerCut)}
              </p>
              <p className="text-xs text-gray-500 mt-1">50% of profit</p>
            </div>
          </div>

          {/* Profit Breakdown */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4">
              Profit Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Revenue:</span>
                <span className="text-white font-medium">
                  {formatCurrency(existingReport.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">- Barber Commissions:</span>
                <span className="text-red-400 font-medium">
                  -{formatCurrency(existingReport.totalBarberCommissions)}
                </span>
              </div>
              <div className="h-px bg-gray-800 my-2"></div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Profit:</span>
                <span className="text-green-500 font-bold">
                  {formatCurrency(existingReport.profit)}
                </span>
              </div>
            </div>
          </div>

          {/* Barber Breakdown */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4">
              Individual Barber Breakdown
            </h3>
            {existingReport.barberBreakdown.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No barber activity for this day
              </p>
            ) : (
              <div className="space-y-4">
                {existingReport.barberBreakdown.map((barber) => (
                  <div
                    key={barber.barberId}
                    className="bg-[#0a0a0a] rounded-lg p-4 border border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">
                        {barber.barberName}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {barber.serviceCount} service
                        {barber.serviceCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Revenue Generated
                        </p>
                        <p className="text-lg font-bold text-white">
                          {formatCurrency(barber.revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Commission Payout
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(barber.commission)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State / Loading */}
      {!existingReport && !isLoadingReport && (
        <div className="bg-[#1a1a1a] rounded-lg p-12 border border-gray-800 text-center">
          <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No report found for this date</p>
          <p className="text-sm text-gray-500">
            Click &quot;Generate Report&quot; to create an end-of-day report for
            the selected date
          </p>
        </div>
      )}

      {isLoadingReport && (
        <div className="bg-[#1a1a1a] rounded-lg p-12 border border-gray-800 text-center">
          <Loader2 className="h-16 w-16 text-gray-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading report...</p>
        </div>
      )}
    </div>
  )
}
