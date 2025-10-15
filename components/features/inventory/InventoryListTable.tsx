import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, SlidersHorizontal } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import type { InventoryItem } from '@/types/inventory'

interface InventoryListTableProps {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onDelete: (itemId: string) => void
  onAdjustStock: (item: InventoryItem) => void
}

export function InventoryListTable({
  items,
  onEdit,
  onDelete,
  onAdjustStock,
}: InventoryListTableProps) {
  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Cost Price</TableHead>
            <TableHead>Reorder Point</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className={
                item.stock <= item.reorderPoint
                  ? 'bg-red-900/20 hover:bg-red-900/30'
                  : 'hover:bg-gray-800/50'
              }
            >
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.brand}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell
                className={
                  item.stock <= item.reorderPoint
                    ? 'text-red-400 font-bold'
                    : ''
                }
              >
                {item.stock}
              </TableCell>
              <TableCell>{formatCurrency(item.price || 0)}</TableCell>
              <TableCell>{formatCurrency(item.costPrice)}</TableCell>
              <TableCell>{item.reorderPoint}</TableCell>
              <TableCell>{item.unitOfMeasure}</TableCell>
              <TableCell>
                {item.lastUpdated
                  ? new Date(item.lastUpdated).toLocaleDateString()
                  : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="text-primary hover:bg-primary/10 mr-2"
                  aria-label="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  className="text-red-500 hover:bg-red-500/10"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAdjustStock(item)}
                  className="text-blue-500 hover:bg-blue-500/10 ml-2"
                  aria-label="Adjust Stock"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
