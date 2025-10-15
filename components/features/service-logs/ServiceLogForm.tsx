'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Check } from 'lucide-react'
import { createServiceLog } from '@/lib/firebase/repositories/service-log-repository'
import { useServices } from '@/hooks/useServices'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/lib/utils/formatters'
import type { Service } from '@/types/firestore'

/**
 * Service Log Form Component
 *
 * Allows barbers to log multiple services at once.
 * Each service creates a separate service log entry.
 * Automatically calculates commission based on barber's commission rate.
 */
export function ServiceLogForm() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set()
  )
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: services, isLoading: servicesLoading } = useServices()

  const createLogsMutation = useMutation({
    mutationFn: async ({
      serviceIds,
      prices,
    }: {
      serviceIds: string[]
      prices: Record<string, number>
    }) => {
      if (!user?.id) {
        throw new Error('User data missing')
      }

      const servicesToLog =
        services?.filter((s) => serviceIds.includes(s.id)) || []

      // Create logs for each selected service with custom prices
      const logPromises = servicesToLog.map((service) => {
        const price = prices[service.id] || service.price
        return createServiceLog({
          barberId: user.id,
          serviceId: service.id,
          price: price,
          commissionRate: service.commissionRate,
          commissionAmount: price * service.commissionRate,
        })
      })

      return Promise.all(logPromises)
    },
    onMutate: async () => {
      setIsSubmitting(true)
      await queryClient.cancelQueries({ queryKey: ['serviceLogs'] })
    },
    onError: (error) => {
      console.error('Service log creation error:', error)
      toast.error('Failed to log services. Please try again.')
    },
    onSuccess: (data) => {
      const count = data.length
      toast.success(
        count === 1
          ? 'Service logged successfully!'
          : `${count} services logged successfully!`
      )
      setSelectedServices(new Set())
      setCustomPrices({})
    },
    onSettled: () => {
      setIsSubmitting(false)
      queryClient.invalidateQueries({ queryKey: ['serviceLogs'] })
    },
  })

  const toggleService = (serviceId: string, defaultPrice: number) => {
    setSelectedServices((prev) => {
      const next = new Set(prev)
      if (next.has(serviceId)) {
        next.delete(serviceId)
        // Remove custom price when unselecting
        setCustomPrices((prevPrices) => {
          const newPrices = { ...prevPrices }
          delete newPrices[serviceId]
          return newPrices
        })
      } else {
        next.add(serviceId)
        // Initialize with default price
        setCustomPrices((prevPrices) => ({
          ...prevPrices,
          [serviceId]: defaultPrice,
        }))
      }
      return next
    })
  }

  const updatePrice = (serviceId: string, price: number) => {
    setCustomPrices((prev) => ({
      ...prev,
      [serviceId]: price,
    }))
  }

  const handleSubmit = () => {
    if (selectedServices.size === 0) {
      toast.error('Please select at least one service')
      return
    }

    createLogsMutation.mutate({
      serviceIds: Array.from(selectedServices),
      prices: customPrices,
    })
  }

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">
          No services available. Contact your manager to add services.
        </p>
      </div>
    )
  }

  const selectedTotal = Array.from(selectedServices).reduce(
    (sum, serviceId) => {
      return sum + (customPrices[serviceId] || 0)
    },
    0
  )

  const selectedCommission = Array.from(selectedServices).reduce(
    (sum, serviceId) => {
      const service = services?.find((s) => s.id === serviceId)
      const price = customPrices[serviceId] || 0
      return sum + (service ? price * service.commissionRate : 0)
    },
    0
  )

  return (
    <div className="space-y-6">
      {/* Service Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const isSelected = selectedServices.has(service.id)
          const currentPrice = customPrices[service.id] || service.price
          const commission = currentPrice * service.commissionRate

          return (
            <div key={service.id} className="space-y-2">
              <button
                type="button"
                onClick={() => toggleService(service.id, service.price)}
                disabled={isSubmitting}
                className={`
                  relative p-4 rounded-lg border-2 text-left transition-all w-full
                  ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-800 bg-[#1a1a1a] hover:border-gray-700'
                  }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Service Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-white pr-8">
                    {service.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>Default: {formatCurrency(service.price)}</p>
                    <p>Duration: {service.duration} min</p>
                  </div>
                </div>
              </button>

              {/* Price Input (shown when selected) */}
              {isSelected && (
                <div className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-800 space-y-2">
                  <label className="text-xs font-medium text-gray-400">
                    Actual Price (LKR)
                  </label>
                  <Input
                    type="number"
                    value={currentPrice}
                    onChange={(e) =>
                      updatePrice(service.id, parseFloat(e.target.value) || 0)
                    }
                    onClick={(e) => e.stopPropagation()}
                    disabled={isSubmitting}
                    className="bg-[#0a0a0a] border-gray-800 text-white"
                    step="50"
                    min="0"
                  />
                  <p className="text-xs text-primary">
                    Your Commission: {formatCurrency(commission)}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary and Submit */}
      {selectedServices.size > 0 && (
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-gray-400">
                {selectedServices.size} service
                {selectedServices.size !== 1 ? 's' : ''} selected
              </p>
              <p className="text-2xl font-bold text-white">
                Total: {formatCurrency(selectedTotal)}
              </p>
              <p className="text-lg text-primary font-medium">
                Your Commission: {formatCurrency(selectedCommission)}
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Services
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
