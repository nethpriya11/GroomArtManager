'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Navigation } from '@/components/features/common/Navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { ServiceFormDialog } from '@/components/features/services/ServiceFormDialog'
import { DeleteServiceDialog } from '@/components/features/services/DeleteServiceDialog'
import { useServices } from '@/hooks/useServices'
import { formatCurrency } from '@/lib/utils/formatters'
import type { Service } from '@/types/firestore'

/**
 * Manager Services Page
 *
 * Allows managers to view and manage the service catalog.
 * Services can be created, edited, and deleted.
 */
export default function ManagerServicesPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  // Fetch services with real-time updates
  const { data: services, isLoading, error } = useServices()

  const handleAddService = () => {
    setSelectedService(null)
    setFormDialogOpen(true)
  }

  const handleEditService = (service: Service) => {
    setSelectedService(service)
    setFormDialogOpen(true)
  }

  const handleDeleteService = (service: Service) => {
    setSelectedService(service)
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
          <h1 className="text-3xl font-bold text-white">Services</h1>
          <Button
            onClick={handleAddService}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        {/* Services Grid */}
        {isLoading && <p className="text-gray-400">Loading services...</p>}

        {error && (
          <p className="text-red-500">
            Error loading services. Please try again.
          </p>
        )}

        {services && services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              No services yet. Add your first service to get started.
            </p>
          </div>
        )}

        {services && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {service.name}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                      onClick={() => handleEditService(service)}
                      aria-label={`Edit ${service.name}`}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      onClick={() => handleDeleteService(service)}
                      aria-label={`Delete ${service.name}`}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>Price: {formatCurrency(service.price)}</p>
                  <p>Duration: {service.duration} minutes</p>
                  <p className="text-primary">
                    Commission: {(service.commissionRate * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Service Dialog */}
      <ServiceFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        service={selectedService}
      />

      {/* Delete Service Dialog */}
      <DeleteServiceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        service={selectedService}
      />
    </div>
  )
}
