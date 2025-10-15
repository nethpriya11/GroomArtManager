'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import {
  createServiceSchema,
  type CreateServiceInput,
} from '@/lib/validations/schemas'
import {
  createService,
  updateService,
} from '@/lib/firebase/repositories/service-repository'
import type { Service } from '@/types/firestore'

interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service | null // For edit mode
}

/**
 * Service Form Dialog Component
 *
 * Modal dialog for creating/editing services with form validation.
 * Uses React Hook Form with Zod validation and React Query mutations.
 */
export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
}: ServiceFormDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!service

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    mode: 'onChange',
    defaultValues: service
      ? {
          name: service.name,
          price: service.price,
          duration: service.duration,
          commissionRate: service.commissionRate,
        }
      : undefined,
  })

  // Reset form when service changes or dialog opens
  useEffect(() => {
    if (open && service) {
      reset({
        name: service.name,
        price: service.price,
        duration: service.duration,
        commissionRate: service.commissionRate,
      })
    } else if (open && !service) {
      reset({
        name: '',
        price: 0,
        duration: 0,
        commissionRate: 0.4, // Default 40%
      })
    }
  }, [open, service, reset])

  // React Query mutation for creating service
  const createServiceMutation = useMutation({
    mutationFn: createService,
    onMutate: async (newService) => {
      setIsSubmitting(true)
      await queryClient.cancelQueries({ queryKey: ['services'] })
      const previousServices = queryClient.getQueryData(['services'])

      queryClient.setQueryData(['services'], (old: any) => {
        if (!old) return [{ ...newService, id: 'temp' }]
        return [{ ...newService, id: 'temp' }, ...old]
      })

      return { previousServices }
    },
    onError: (error, newService, context) => {
      queryClient.setQueryData(['services'], context?.previousServices)
      console.error('Service creation error:', error)
      toast.error('Failed to create service. Please try again.')
    },
    onSuccess: (data) => {
      toast.success(`Service "${data.name}" added successfully!`)
      onOpenChange(false)
      reset()
    },
    onSettled: () => {
      setIsSubmitting(false)
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  // React Query mutation for updating service
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateServiceInput }) =>
      updateService(id, data),
    onMutate: async ({ id, data }) => {
      setIsSubmitting(true)
      await queryClient.cancelQueries({ queryKey: ['services'] })
      const previousServices = queryClient.getQueryData(['services'])

      queryClient.setQueryData(['services'], (old: any) => {
        if (!old) return []
        return old.map((s: Service) => (s.id === id ? { ...s, ...data } : s))
      })

      return { previousServices }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['services'], context?.previousServices)
      console.error('Service update error:', error)
      toast.error('Failed to update service. Please try again.')
    },
    onSuccess: (_, variables) => {
      toast.success(`Service "${variables.data.name}" updated successfully!`)
      onOpenChange(false)
      reset()
    },
    onSettled: () => {
      setIsSubmitting(false)
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const onSubmit = (data: CreateServiceInput) => {
    if (isEditMode && service) {
      updateServiceMutation.mutate({ id: service.id, data })
    } else {
      createServiceMutation.mutate(data)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the service details below.'
              : 'Create a new service that barbers can log for clients.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Haircut, Beard Trim"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (LKR) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                LKR
              </span>
              <Input
                id="price"
                type="number"
                step="50"
                min="0"
                placeholder="1500.00"
                className="pl-14"
                {...register('price', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration *</Label>
            <div className="relative">
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="30"
                {...register('duration', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                minutes
              </span>
            </div>
            {errors.duration && (
              <p className="text-sm text-red-500">{errors.duration.message}</p>
            )}
          </div>

          {/* Commission Rate */}
          <div className="space-y-2">
            <Label htmlFor="commissionRate">Commission Rate *</Label>
            <div className="relative">
              <Input
                id="commissionRate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                placeholder="0.45"
                {...register('commissionRate', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                (0-1)
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Enter as decimal: 0.40 = 40%, 0.45 = 45%, 0.50 = 50%
            </p>
            {errors.commissionRate && (
              <p className="text-sm text-red-500">
                {errors.commissionRate.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditMode ? (
                'Update Service'
              ) : (
                'Add Service'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
