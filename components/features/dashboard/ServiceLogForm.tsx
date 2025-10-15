import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Clock } from 'lucide-react'

/**
 * Service Log Form Component
 *
 * Form for managers to log services on behalf of barbers.
 * Currently disabled as a placeholder for Epic 3 implementation.
 *
 * Features:
 * - Disabled state with visual feedback
 * - "Feature coming soon" message
 * - Maintains layout structure for future implementation
 */
export function ServiceLogForm() {
  return (
    <Card className="bg-[#1a1a1a] border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <PlusCircle className="h-5 w-5 text-primary" />
          Log a Service
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 opacity-50 cursor-not-allowed">
          {/* Barber Selection */}
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">
              Select Barber
            </label>
            <div className="w-full h-10 bg-[#0a0a0a] border border-gray-800 rounded-md" />
          </div>

          {/* Service Selection */}
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-2">
              Select Service
            </label>
            <div className="w-full h-10 bg-[#0a0a0a] border border-gray-800 rounded-md" />
          </div>

          {/* Submit Button */}
          <Button
            disabled
            className="w-full cursor-not-allowed"
            variant="default"
          >
            Log Service
          </Button>
        </div>

        {/* Coming Soon Message */}
        <div className="flex items-center justify-center gap-2 mt-6 p-4 bg-[#0a0a0a] border border-gray-800 rounded-md">
          <Clock className="h-4 w-4 text-primary" />
          <p className="text-sm text-gray-400">Feature coming soon</p>
        </div>
      </CardContent>
    </Card>
  )
}
