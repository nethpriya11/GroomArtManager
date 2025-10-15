import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { InventoryItem, StockAdjustment } from '@/types/inventory'

const COLLECTION_NAME = 'inventoryItems'

// Helper to convert Firestore Timestamp to number (epoch milliseconds)
const convertTimestampsToMillis = (item: any) => ({
  ...item,
  createdAt: item.createdAt?.toMillis() || 0,
  lastUpdated: item.lastUpdated?.toMillis() || 0,
})

/**
 * Create a new inventory item
 *
 * @param data - Inventory item data
 * @returns Promise<InventoryItem> - Created inventory item with generated ID
 */
export async function createInventoryItem(data: {
  name: string
  brand: string
  category: string
  sku: string
  stock: number
  price?: number
  costPrice: number
  reorderPoint: number
  unitOfMeasure: string
  supplierId?: string | null
  isSellable?: boolean
}): Promise<InventoryItem> {
  const now = Timestamp.now()
  const itemData = {
    ...data,
    supplierId: data.supplierId || null,
    createdAt: now,
    lastUpdated: now,
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), itemData)

  return {
    id: docRef.id,
    ...convertTimestampsToMillis(itemData),
  } as InventoryItem
}

/**
 * Get an inventory item by ID
 *
 * @param itemId - Inventory item document ID
 * @returns Promise<InventoryItem | null> - Inventory item or null if not found
 */
export async function getInventoryItem(
  itemId: string
): Promise<InventoryItem | null> {
  const docRef = doc(db, COLLECTION_NAME, itemId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return convertTimestampsToMillis({
    id: docSnap.id,
    ...docSnap.data(),
  }) as InventoryItem
}

/**
 * Get all inventory items
 *
 * @returns Promise<InventoryItem[]> - Array of all inventory items, ordered by name
 */
export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(
    (doc) =>
      convertTimestampsToMillis({
        id: doc.id,
        ...doc.data(),
      }) as InventoryItem
  )
}

/**
 * Update an inventory item
 *
 * @param itemId - Inventory item document ID
 * @param data - Partial inventory item data to update
 * @returns Promise<void>
 */
export async function updateInventoryItem(
  itemId: string,
  data: Partial<InventoryItem>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, itemId)
  await updateDoc(docRef, {
    ...data,
    supplierId: data.supplierId || null,
    lastUpdated: Timestamp.now(),
  })
}

/**
 * Delete an inventory item
 *
 * @param itemId - Inventory item document ID
 * @returns Promise<void>
 */
export async function deleteInventoryItem(itemId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, itemId)
  await deleteDoc(docRef)
}

/**
 * Create a new stock adjustment log
 *
 * @param data - Stock adjustment data
 * @returns Promise<StockAdjustment> - Created stock adjustment log
 */
export async function createStockAdjustment(data: {
  itemId: string
  quantity: number
  type: 'add' | 'deduct' | 'damage' | 'return'
  reason?: string
  adjustedBy: string // User ID of who made the adjustment
}): Promise<StockAdjustment> {
  const adjustmentData = {
    ...data,
    adjustedAt: Timestamp.now(),
  }

  const docRef = await addDoc(
    collection(db, 'stockAdjustments'),
    adjustmentData
  )

  return {
    id: docRef.id,
    ...adjustmentData,
    adjustedAt: adjustmentData.adjustedAt.toMillis(),
  } as StockAdjustment
}
