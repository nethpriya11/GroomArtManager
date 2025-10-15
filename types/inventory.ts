export interface InventoryItem {
  id: string
  name: string
  brand: string
  category: string
  sku: string
  stock: number
  price?: number // Selling price
  costPrice: number // Cost to the salon
  reorderPoint: number
  unitOfMeasure: string // e.g., "bottle", "gram", "piece"
  supplierId?: string // Optional, if we want to track suppliers
  isSellable?: boolean // Is the item for sale?
  createdAt: number // Stored as epoch milliseconds
  lastUpdated: number // Stored as epoch milliseconds
}

export interface StockAdjustment {
  id: string
  itemId: string
  quantity: number
  type: 'add' | 'deduct' | 'damage' | 'return'
  reason?: string
  adjustedBy: string // User ID of who made the adjustment
  adjustedAt: number // Stored as epoch milliseconds
}
