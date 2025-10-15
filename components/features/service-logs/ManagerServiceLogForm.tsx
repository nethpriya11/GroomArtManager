'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Check } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useServices } from '@/hooks/useServices'
import { useUsers } from '@/hooks/useUsers'
import { formatCurrency } from '@/lib/utils/formatters'
import type { UserProfile } from '@/types/firestore'

/**
 * Manager Service Log Form Component
 *
 * Allows managers to log services on behalf of barbers.
 * Services logged by managers are automatically approved.
 */
export function ManagerServiceLogForm() {
  const queryClient = useQueryClient()
  const [selectedBarberId, setSelectedBarberId] = useState<string>('')
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set()
  )
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: services, isLoading: servicesLoading } = useServices()
  const { data: users, isLoading: usersLoading } = useUsers()

  // Filter only barbers
  const barbers = users?.filter((u) => u.role === 'barber') || []

  const createLogsMutation = useMutation({
    mutationFn: async ({
      barberId,
      serviceIds,
      prices,
    }: {
      barberId: string
      serviceIds: string[]
      prices: Record<string, number>
    }) => {
      const barber = barbers.find((b) => b.id === barberId)
      if (!barber) {
        throw new Error('Barber data missing')
      }

      const servicesToLog =
        services?.filter((s) => serviceIds.includes(s.id)) || []

      // Create logs for each selected service (auto-approved)
      const logPromises = servicesToLog.map(async (service) => {
        const price = prices[service.id] || service.price
        const logData = {
          barberId: barber.id,
          serviceId: service.id,
          price: price,
          commissionRate: service.commissionRate,
          commissionAmount: price * service.commissionRate,
          status: 'approved' as const,
          createdAt: Timestamp.now(),
          approvedAt: Timestamp.now(), // Auto-approved by manager
          rejectedAt: null,
        }

        const docRef = await addDoc(collection(db, 'serviceLogs'), logData)
        return { id: docRef.id, ...logData }
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
          ? 'Service logged and approved successfully!'
          : `${count} services logged and approved successfully!`
      )
      setSelectedServices(new Set())
      setCustomPrices({})
      setSelectedBarberId('')
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
    if (!selectedBarberId) {
      toast.error('Please select a barber')
      return
    }

    if (selectedServices.size === 0) {
      toast.error('Please select at least one service')
      return
    }

    createLogsMutation.mutate({
      barberId: selectedBarberId,
      serviceIds: Array.from(selectedServices),
      prices: customPrices,
    })
  }

  if (servicesLoading || usersLoading) {
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
          No services available. Please add services first.
        </p>
      </div>
    )
  }

  if (barbers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No barbers available.</p>
      </div>
    )
  }

  const selectedBarber = barbers.find((b) => b.id === selectedBarberId)
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
      {/* Barber Selection */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <label className="block text-sm font-medium text-white mb-2">
          Select Barber
        </label>
        <Select value={selectedBarberId} onValueChange={setSelectedBarberId}>
          <SelectTrigger className="w-full bg-[#0a0a0a] border-gray-800 text-white">
            <SelectValue placeholder="Choose a barber..." />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-gray-800">
            {barbers.map((barber) => (
              <SelectItem
                key={barber.id}
                value={barber.id}
                className="text-white hover:bg-[#0a0a0a]"
              >
                {barber.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Service Selection Grid */}
      {selectedBarberId && (
        <>
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
                          updatePrice(
                            service.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        disabled={isSubmitting}
                        className="bg-[#0a0a0a] border-gray-800 text-white"
                        step="50"
                        min="0"
                      />
                      <p className="text-xs text-primary">
                        Commission: {formatCurrency(commission)}
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
                    Logging for:{' '}
                    <span className="text-white font-medium">
                      {selectedBarber?.username}
                    </span>
                  </p>
                  <p className="text-gray-400">
                    {selectedServices.size} service
                    {selectedServices.size !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-2xl font-bold text-white">
                    Total: {formatCurrency(selectedTotal)}
                  </p>
                  <p className="text-lg text-primary font-medium">
                    Barber Commission: {formatCurrency(selectedCommission)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ✓ Will be automatically approved
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
                      Log & Approve Services
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
