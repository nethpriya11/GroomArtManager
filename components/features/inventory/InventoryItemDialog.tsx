'use client'

import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  inventoryItemSchema,
  InventoryItemInput,
} from '@/lib/validations/inventory-schemas'
import {
  createInventoryItem,
  updateInventoryItem,
} from '@/lib/firebase/repositories/inventory-repository'
import type { InventoryItem } from '@/types/inventory'

interface InventoryItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: InventoryItem | null
}

export function InventoryItemDialog({
  open,
  onOpenChange,
  item,
}: InventoryItemDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!item

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    control,
    setValue,
  } = useForm<InventoryItemInput>({
    resolver: zodResolver(inventoryItemSchema),
    mode: 'onChange',
    defaultValues: item
      ? {
          ...item,
          supplierId: item.supplierId || '',
          isSellable: item.isSellable ?? true,
        }
      : {
          name: '',
          brand: '',
          category: '',
          sku: '',
          stock: 0,
          price: 0,
          costPrice: 0,
          reorderPoint: 0,
          unitOfMeasure: '',
          supplierId: '',
          isSellable: true,
        },
  })

  const isSellable = useWatch({
    control,
    name: 'isSellable',
  })

  useEffect(() => {
    const defaultValues = {
      name: '',
      brand: '',
      category: '',
      sku: '',
      stock: 0,
      price: 0,
      costPrice: 0,
      reorderPoint: 0,
      unitOfMeasure: '',
      supplierId: '',
      isSellable: true,
    }

    if (open) {
      if (item) {
        reset({
          ...defaultValues,
          ...item,
          supplierId: item.supplierId || '',
          isSellable: item.isSellable ?? true,
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [open, item, reset])

  const createItemMutation = useMutation({
    mutationFn: createInventoryItem,
    onMutate: async (newItem) => {
      setIsSubmitting(true)
      await queryClient.cancelQueries({ queryKey: ['inventoryItems'] })
      const previousItems = queryClient.getQueryData(['inventoryItems'])
      const tempId = `temp-${Date.now()}`

      queryClient.setQueryData(['inventoryItems'], (old: any) => {
        if (!old) return [{ ...newItem, id: tempId }]
        return [...old, { ...newItem, id: tempId }]
      })

      return { previousItems }
    },
    onError: (error, newItem, context) => {
      queryClient.setQueryData(['inventoryItems'], context?.previousItems)
      console.error('Inventory item creation error:', error)
      toast.error('Failed to create inventory item. Please try again.')
    },
    onSuccess: (data) => {
      toast.success(`Item "${data.name}" added successfully!`)
      onOpenChange(false)
    },
    onSettled: () => {
      setIsSubmitting(false)
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] })
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InventoryItemInput }) =>
      updateInventoryItem(id, data),
    onMutate: async ({ id, data }) => {
      setIsSubmitting(true)
      await queryClient.cancelQueries({ queryKey: ['inventoryItems'] })
      const previousItems = queryClient.getQueryData(['inventoryItems'])

      queryClient.setQueryData(['inventoryItems'], (old: any) => {
        if (!old) return []
        return old.map((i: InventoryItem) =>
          i.id === id ? { ...i, ...data } : i
        )
      })

      return { previousItems }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['inventoryItems'], context?.previousItems)
      console.error('Inventory item update error:', error)
      toast.error('Failed to update inventory item. Please try again.')
    },
    onSuccess: (_, variables) => {
      toast.success(`Item "${variables.data.name}" updated successfully!`)
      onOpenChange(false)
    },
    onSettled: () => {
      setIsSubmitting(false)
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] })
    },
  })

  const onSubmit = (data: InventoryItemInput) => {
    if (isEditMode && item) {
      updateItemMutation.mutate({ id: item.id, data })
    } else {
      createItemMutation.mutate(data)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the inventory item details below.'
              : 'Add a new inventory item to your stock.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="stock">Stock</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Hair Gel"
                    {...register('name')}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., L'Oréal"
                    {...register('brand')}
                    disabled={isSubmitting}
                  />
                  {errors.brand && (
                    <p className="text-sm text-red-500">
                      {errors.brand.message}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Hair Care"
                    {...register('category')}
                    disabled={isSubmitting}
                  />
                  {errors.category && (
                    <p className="text-sm text-red-500">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* SKU */}
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    placeholder="e.g., HGEL001"
                    {...register('sku')}
                    disabled={isSubmitting}
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500">{errors.sku.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stock" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unit of Measure */}
                <div className="space-y-2">
                  <Label htmlFor="unitOfMeasure">Unit of Measure *</Label>
                  <Input
                    id="unitOfMeasure"
                    placeholder="e.g., bottle, gram, piece"
                    {...register('unitOfMeasure')}
                    disabled={isSubmitting}
                  />
                  {errors.unitOfMeasure && (
                    <p className="text-sm text-red-500">
                      {errors.unitOfMeasure.message}
                    </p>
                  )}
                </div>

                {/* Cost Price */}
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price (per unit) *</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 8.50"
                    {...register('costPrice', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.costPrice && (
                    <p className="text-sm text-red-500">
                      {errors.costPrice.message}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="e.g., 50"
                    {...register('stock', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-500">
                      {errors.stock.message}
                    </p>
                  )}
                </div>

                {/* Reorder Point */}
                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">Reorder Point *</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    placeholder="e.g., 10"
                    {...register('reorderPoint', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.reorderPoint && (
                    <p className="text-sm text-red-500">
                      {errors.reorderPoint.message}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* isSellable Checkbox */}
                <div className="flex items-center space-x-2 pt-2 md:col-span-2">
                  <Checkbox
                    id="isSellable"
                    {...register('isSellable')}
                    checked={isSellable}
                    onCheckedChange={(checked: boolean) => {
                      setValue('isSellable', checked)
                    }}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="isSellable">This item is for sale</Label>
                </div>

                {/* Price */}
                {isSellable && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Selling Price (per unit) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 15.99"
                      {...register('price', { valueAsNumber: true })}
                      disabled={isSubmitting}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supplier ID (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="supplierId">Supplier ID (Optional)</Label>
                  <Input
                    id="supplierId"
                    placeholder="e.g., SUP001"
                    {...register('supplierId')}
                    disabled={isSubmitting}
                  />
                  {errors.supplierId && (
                    <p className="text-sm text-red-500">
                      {errors.supplierId.message}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
                  {isEditMode ? 'Updating...' : 'Adding...'}
                </>
              ) : isEditMode ? (
                'Update Item'
              ) : (
                'Add Item'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
