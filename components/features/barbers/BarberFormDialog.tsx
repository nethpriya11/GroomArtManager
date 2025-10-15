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
  createBarberSchema,
  updateBarberSchema,
  CreateBarberInput,
  UpdateBarberInput,
} from '@/lib/validations/schemas'
import {
  createBarber,
  updateBarber,
} from '@/lib/firebase/repositories/barber-repository'
import type { UserProfile } from '@/types/firestore'

interface BarberFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barber?: UserProfile | null
}

type FormInput = CreateBarberInput | UpdateBarberInput

export function BarberFormDialog({
  open,
  onOpenChange,
  barber,
}: BarberFormDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!barber

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormInput>({
    resolver: zodResolver(isEditMode ? updateBarberSchema : createBarberSchema),
    mode: 'onChange',
    defaultValues: barber
      ? {
          username: barber.username,
        }
      : {
          username: '',
          password: '',
        },
  })

  useEffect(() => {
    if (open && barber) {
      reset({
        username: barber.username,
      })
    } else if (open && !barber) {
      reset({
        username: '',
        password: '',
      })
    }
  }, [open, barber, reset])

  const createBarberMutation = useMutation({
    mutationFn: createBarber,
    onMutate: async (newBarber) => {
      setIsSubmitting(true)
      await queryClient.cancelQueries({ queryKey: ['users', 'barbers'] })
      const previousBarbers = queryClient.getQueryData(['users', 'barbers'])

      queryClient.setQueryData(['users', 'barbers'], (old: any) => {
        if (!old) return [{ ...newBarber, id: 'temp' }]
        return [...old, { ...newBarber, id: 'temp' }]
      })

      return { previousBarbers }
    },
    onError: (error, newBarber, context) => {
      queryClient.setQueryData(['users', 'barbers'], context?.previousBarbers)
      console.error('Barber creation error:', error)
      toast.error('Failed to create barber. Please try again.')
    },
    onSuccess: (data) => {
      toast.success(`Barber "${data.username}" added successfully!`)
      onOpenChange(false)
      reset()
    },
    onSettled: () => {
      setIsSubmitting(false)
      queryClient.invalidateQueries({ queryKey: ['users', 'barbers'] })
    },
  })

  const updateBarberMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBarberInput }) =>
      updateBarber(id, data),
    onMutate: async ({ id, data }) => {
      setIsSubmitting(true)
      await queryClient.cancelQueries({ queryKey: ['users', 'barbers'] })
      const previousBarbers = queryClient.getQueryData(['users', 'barbers'])

      queryClient.setQueryData(['users', 'barbers'], (old: any) => {
        if (!old) return []
        return old.map((b: UserProfile) =>
          b.id === id ? { ...b, ...data } : b
        )
      })

      return { previousBarbers }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['users', 'barbers'], context?.previousBarbers)
      console.error('Barber update error:', error)
      toast.error('Failed to update barber. Please try again.')
    },
    onSuccess: (_, variables) => {
      toast.success(`Barber "${variables.data.username}" updated successfully!`)
      onOpenChange(false)
      reset()
    },
    onSettled: () => {
      setIsSubmitting(false)
      queryClient.invalidateQueries({ queryKey: ['users', 'barbers'] })
    },
  })

  const onSubmit = (data: FormInput) => {
    if (isEditMode && barber) {
      updateBarberMutation.mutate({
        id: barber.id,
        data: data as UpdateBarberInput,
      })
    } else {
      createBarberMutation.mutate(data as CreateBarberInput)
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
            {isEditMode ? 'Edit Barber' : 'Add New Barber'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the barber details below.'
              : 'Add a new barber to your team.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Barber Name *</Label>
            <Input
              id="username"
              placeholder="e.g., John Smith"
              {...register('username')}
              disabled={isSubmitting}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Password (only for new barber) */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                {...register('password')}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {/* Password (optional for existing barber) */}
          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="password">New Password (optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password to change"
                {...register('password')}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

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
                'Update Barber'
              ) : (
                'Add Barber'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
