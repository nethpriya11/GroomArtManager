import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KPICardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
}

export function KPICard({ title, value, icon }: KPICardProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  )
}
