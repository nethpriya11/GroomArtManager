import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAllInventoryItems,
  getInventoryItem,
} from '@/lib/firebase/repositories/inventory-repository'

export function useInventoryItems() {
  return useQuery({
    queryKey: ['inventoryItems'],
    queryFn: getAllInventoryItems,
  })
}

export function useInventoryItem(itemId: string) {
  return useQuery({
    queryKey: ['inventoryItems', itemId],
    queryFn: () => getInventoryItem(itemId),
    enabled: !!itemId,
  })
}
