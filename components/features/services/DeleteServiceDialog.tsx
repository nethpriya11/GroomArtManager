'use client'

import { useState } from 'react'
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
import { Loader2 } from 'lucide-react'
import { deleteService } from '@/lib/firebase/repositories/service-repository'
import type { Service } from '@/types/firestore'

interface DeleteServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
}

/**
 * Delete Service Confirmation Dialog
 *
 * Confirms deletion of a service with React Query mutation.
 */
export function DeleteServiceDialog({
  open,
  onOpenChange,
  service,
}: DeleteServiceDialogProps) {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onMutate: async (serviceId) => {
      setIsDeleting(true)
      await queryClient.cancelQueries({ queryKey: ['services'] })
      const previousServices = queryClient.getQueryData(['services'])

      // Optimistically remove from list
      queryClient.setQueryData(['services'], (old: any) => {
        if (!old) return []
        return old.filter((s: Service) => s.id !== serviceId)
      })

      return { previousServices }
    },
    onError: (error, serviceId, context) => {
      queryClient.setQueryData(['services'], context?.previousServices)
      console.error('Service deletion error:', error)
      toast.error('Failed to delete service. Please try again.')
    },
    onSuccess: () => {
      toast.success(`Service "${service?.name}" deleted successfully!`)
      onOpenChange(false)
    },
    onSettled: () => {
      setIsDeleting(false)
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const handleDelete = () => {
    if (service) {
      deleteServiceMutation.mutate(service.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Service</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">{service?.name}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
