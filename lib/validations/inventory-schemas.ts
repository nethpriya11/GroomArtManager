import { z } from 'zod'

export const inventoryItemSchema = z
  .object({
    name: z.string().min(1, 'Item name is required'),
    brand: z.string().min(1, 'Brand is required'),
    category: z.string().min(1, 'Category is required'),
    sku: z.string().min(1, 'SKU is required'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    price: z.number().min(0, 'Price cannot be negative').optional(),
    costPrice: z.number().min(0, 'Cost price cannot be negative'),
    reorderPoint: z.number().int().min(0, 'Reorder point cannot be negative'),
    unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
    supplierId: z.string().optional(),
    isSellable: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.isSellable) {
        return data.price !== undefined && data.price !== null
      }
      return true
    },
    {
      message: 'Price is required for sellable items',
      path: ['price'],
    }
  )

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>
