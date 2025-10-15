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
import { deleteBarber } from '@/lib/firebase/repositories/barber-repository'
import type { UserProfile } from '@/types/firestore'

interface DeleteBarberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barber: UserProfile | null
}

export function DeleteBarberDialog({
  open,
  onOpenChange,
  barber,
}: DeleteBarberDialogProps) {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteBarberMutation = useMutation({
    mutationFn: deleteBarber,
    onMutate: async (barberId) => {
      setIsDeleting(true)
      await queryClient.cancelQueries({ queryKey: ['users', 'barbers'] })
      const previousBarbers = queryClient.getQueryData(['users', 'barbers'])

      queryClient.setQueryData(['users', 'barbers'], (old: any) => {
        if (!old) return []
        return old.filter((b: UserProfile) => b.id !== barberId)
      })

      return { previousBarbers }
    },
    onError: (error, barberId, context) => {
      queryClient.setQueryData(['users', 'barbers'], context?.previousBarbers)
      console.error('Barber deletion error:', error)
      toast.error('Failed to delete barber. Please try again.')
    },
    onSuccess: () => {
      toast.success(`Barber "${barber?.username}" deleted successfully!`)
      onOpenChange(false)
    },
    onSettled: () => {
      setIsDeleting(false)
      queryClient.invalidateQueries({ queryKey: ['users', 'barbers'] })
    },
  })

  const handleDelete = () => {
    if (barber) {
      deleteBarberMutation.mutate(barber.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Barber</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">{barber?.username}</span>
            ? This action cannot be undone and will remove all their service
            logs.
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
