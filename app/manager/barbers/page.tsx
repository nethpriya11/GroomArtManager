'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Navigation } from '@/components/features/common/Navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { BarberFormDialog } from '@/components/features/barbers/BarberFormDialog'
import { DeleteBarberDialog } from '@/components/features/barbers/DeleteBarberDialog'
import { useBarbers } from '@/hooks/useBarbers'
import type { UserProfile } from '@/types/firestore'

/**
 * Manager Barbers Page
 *
 * Allows managers to view and manage the barber team.
 * Barbers can be created, edited, and deleted.
 */
export default function ManagerBarbersPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBarber, setSelectedBarber] = useState<UserProfile | null>(null)

  // Fetch barbers with real-time updates
  const { data: barbers, isLoading, error } = useBarbers()

  const handleAddBarber = () => {
    setSelectedBarber(null)
    setFormDialogOpen(true)
  }

  const handleEditBarber = (barber: UserProfile) => {
    setSelectedBarber(barber)
    setFormDialogOpen(true)
  }

  const handleDeleteBarber = (barber: UserProfile) => {
    setSelectedBarber(barber)
    setDeleteDialogOpen(true)
  }

  useEffect(() => {
    if (!user || role !== 'manager') {
      router.push('/login')
    }
  }, [user, role, router])

  if (!user || role !== 'manager') {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navigation role="manager" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Barbers</h1>
          <Button
            onClick={handleAddBarber}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Barber
          </Button>
        </div>

        {/* Barbers Grid */}
        {isLoading && <p className="text-gray-400">Loading barbers...</p>}

        {error && (
          <p className="text-red-500">
            Error loading barbers. Please try again.
          </p>
        )}

        {barbers && barbers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              No barbers yet. Add your first barber to get started.
            </p>
          </div>
        )}

        {barbers && barbers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {barber.username}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                      onClick={() => handleEditBarber(barber)}
                      aria-label={`Edit ${barber.username}`}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      onClick={() => handleDeleteBarber(barber)}
                      aria-label={`Delete ${barber.username}`}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-400">
                  <p className="text-xs text-gray-500">
                    ID: {barber.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Barber Dialog */}
      <BarberFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        barber={selectedBarber}
      />

      {/* Delete Barber Dialog */}
      <DeleteBarberDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        barber={selectedBarber}
      />
    </div>
  )
}
