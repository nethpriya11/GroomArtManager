'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
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
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import {
  stockAdjustmentSchema,
  StockAdjustmentInput,
} from '@/lib/validations/stock-adjustment-schemas'
import {
  createStockAdjustment,
  updateInventoryItem,
} from '@/lib/firebase/repositories/inventory-repository'
import type { InventoryItem } from '@/types/inventory'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  item,
}: StockAdjustmentDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm<StockAdjustmentInput>({
    resolver: zodResolver(stockAdjustmentSchema),
    mode: 'onChange',
    defaultValues: {
      itemId: item.id,
      quantity: 1,
      type: 'deduct',
      reason: '',
      adjustedBy: 'manager',
    },
  })

  const adjustmentType = watch('type')

  const createAdjustmentMutation = useMutation({
    mutationFn: createStockAdjustment,
    onMutate: () => {
      setIsSubmitting(true)
    },
    onSuccess: async (newAdjustment) => {
      // Update the inventory item's stock
      const newStock =
        newAdjustment.type === 'add'
          ? item.stock + newAdjustment.quantity
          : item.stock - newAdjustment.quantity

      await updateInventoryItem(item.id, { stock: newStock })

      toast.success(`Stock for ${item.name} adjusted successfully!`)
      onOpenChange(false)
      reset()
    },
    onError: (error) => {
      console.error('Stock adjustment error:', error)
      toast.error('Failed to adjust stock. Please try again.')
    },
    onSettled: () => {
      setIsSubmitting(false)
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] })
    },
  })

  const onSubmit = (data: StockAdjustmentInput) => {
    createAdjustmentMutation.mutate({
      ...data,
      itemId: item.id,
      adjustedBy: 'manager',
    })
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <VisuallyHidden>
          <DialogTitle>Adjust Stock for {item.name}</DialogTitle>
        </VisuallyHidden>
        <DialogHeader>
          <DialogTitle>Adjust Stock for {item.name}</DialogTitle>
          <DialogDescription>
            Make changes to the current stock level of {item.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Adjustment Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Adjustment Type
            </Label>
            <Select
              onValueChange={(value: 'add' | 'deduct' | 'damage' | 'return') =>
                setValue('type', value)
              }
              defaultValue={adjustmentType}
              disabled={isSubmitting}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Stock</SelectItem>
                <SelectItem value="deduct">
                  Deduct Stock (Usage/Sale)
                </SelectItem>
                <SelectItem value="damage">Damage</SelectItem>
                <SelectItem value="return">Return</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="col-span-4 text-sm text-red-500 text-right">
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              disabled={isSubmitting}
              className="col-span-3"
            />
            {errors.quantity && (
              <p className="col-span-4 text-sm text-red-500 text-right">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Reason (Optional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason (Optional)
            </Label>
            <Textarea
              id="reason"
              {...register('reason')}
              disabled={isSubmitting}
              className="col-span-3"
            />
            {errors.reason && (
              <p className="col-span-4 text-sm text-red-500 text-right">
                {errors.reason.message}
              </p>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adjusting...
              </>
            ) : (
              'Adjust Stock'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
