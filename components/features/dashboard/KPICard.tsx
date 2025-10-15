import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
}

/**
 * KPI Card Component
 *
 * Displays a single key performance indicator (KPI) metric.
 * Used for dashboard statistics like revenue, services count, etc.
 *
 * Features:
 * - Dark theme (#1a1a1a background)
 * - Icon with accent color
 * - Large value display
 * - Optional subtitle
 */
export function KPICard({ title, value, icon: Icon, subtitle }: KPICardProps) {
  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
