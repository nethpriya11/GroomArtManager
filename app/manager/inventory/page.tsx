'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/features/common/Navigation'
import { useAuthStore } from '@/stores/authStore'
import { useInventoryItems } from '@/hooks/useInventory'
import { InventoryItemDialog } from '@/components/features/inventory/InventoryItemDialog'
import { StockAdjustmentDialog } from '@/components/features/inventory/StockAdjustmentDialog'
import { KPICard } from '@/components/features/common/KPICard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteInventoryItem } from '@/lib/firebase/repositories/inventory-repository'
import { InventoryListTable } from '@/components/features/inventory/InventoryListTable'
import { toast } from 'sonner'
import type { InventoryItem } from '@/types/inventory'

export default function ManagerInventoryPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const { data: inventoryItems, isLoading, error } = useInventoryItems()
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterBrand, setFilterBrand] = useState('all')
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user || role !== 'manager') {
      router.push('/login')
    }
  }, [user, role, router])

  const filteredItems = useMemo(() => {
    if (!inventoryItems) return []

    let filtered = inventoryItems

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === filterCategory)
    }

    if (filterBrand !== 'all') {
      filtered = filtered.filter((item) => item.brand === filterBrand)
    }

    return filtered
  }, [inventoryItems, searchTerm, filterCategory, filterBrand])

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      inventoryItems?.map((item) => item.category)
    )
    return ['all', ...Array.from(uniqueCategories)]
  }, [inventoryItems])

  const brands = useMemo(() => {
    const uniqueBrands = new Set(inventoryItems?.map((item) => item.brand))
    return ['all', ...Array.from(uniqueBrands)]
  }, [inventoryItems])

  const inventoryKpis = useMemo(() => {
    if (!inventoryItems) {
      return {
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
      }
    }

    const totalValue = inventoryItems.reduce(
      (acc, item) => acc + item.costPrice * item.stock,
      0
    )
    const lowStockCount = inventoryItems.filter(
      (item) => item.stock <= item.reorderPoint && item.stock > 0
    ).length
    const outOfStockCount = inventoryItems.filter(
      (item) => item.stock === 0
    ).length

    return { totalValue, lowStockCount, outOfStockCount }
  }, [inventoryItems])

  const deleteItemMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      toast.success('Inventory item deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] })
    },
    onError: (err) => {
      console.error('Error deleting item:', err)
      toast.error('Failed to delete item.')
    },
  })

  const handleDelete = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(itemId)
    }
  }

  if (!user || role !== 'manager') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navigation role="manager" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <Button
            onClick={() => {
              setSelectedItem(null)
              setIsItemDialogOpen(true)
            }}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <KPICard
            title="Total Inventory Value"
            value={formatCurrency(inventoryKpis.totalValue)}
          />
          <KPICard
            title="Items Low on Stock"
            value={inventoryKpis.lowStockCount}
          />
          <KPICard
            title="Out of Stock Items"
            value={inventoryKpis.outOfStockCount}
          />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, brand, category, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/60 border-gray-700 text-white"
            />
          </div>

          <div className="flex gap-2">
            <div className="space-y-1">
              <Label
                htmlFor="category-filter"
                className="text-gray-400 text-sm"
              >
                Category
              </Label>
              <select
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-800/60 border-gray-700 rounded-md px-3 py-2 text-white text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="brand-filter" className="text-gray-400 text-sm">
                Brand
              </Label>
              <select
                id="brand-filter"
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="bg-gray-800/60 border-gray-700 rounded-md px-3 py-2 text-white text-sm"
              >
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand === 'all' ? 'All Brands' : brand}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2
              className="h-8 w-8 animate-spin text-primary"
              role="status"
            />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            Failed to load inventory items.
          </div>
        ) : filteredItems && filteredItems.length > 0 ? (
          <InventoryListTable
            items={filteredItems}
            onEdit={(item) => {
              setSelectedItem(item)
              setIsItemDialogOpen(true)
            }}
            onDelete={handleDelete}
            onAdjustStock={(item) => {
              setSelectedItem(item)
              setIsAdjustmentDialogOpen(true)
            }}
          />
        ) : (
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center py-12">
            <h2 className="text-xl font-bold mb-2">No Inventory Items</h2>
            <p className="text-gray-400 mb-4">
              Click the button above to add your first inventory item.
            </p>
            <Button
              onClick={() => {
                setSelectedItem(null)
                setIsItemDialogOpen(true)
              }}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        )}

        <InventoryItemDialog
          open={isItemDialogOpen}
          onOpenChange={setIsItemDialogOpen}
          item={selectedItem}
        />
        {selectedItem && (
          <StockAdjustmentDialog
            open={isAdjustmentDialogOpen}
            onOpenChange={setIsAdjustmentDialogOpen}
            item={selectedItem}
          />
        )}
      </main>
    </div>
  )
}
