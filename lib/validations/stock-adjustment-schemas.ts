import { z } from 'zod'

export const stockAdjustmentSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  type: z.enum(['add', 'deduct', 'damage', 'return'], {
    message: 'Adjustment type is required',
  }),
  reason: z.string().optional(),
  adjustedBy: z.string().min(1, 'Adjusted by user ID is required'),
  adjustedAt: z.date().optional(),
})

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>
