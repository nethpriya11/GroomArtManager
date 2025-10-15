'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useBarbers } from '@/hooks/useBarbers'
import { signInAsBarber } from '@/lib/services/auth'
import { useAuthStore } from '@/stores/authStore'
import { handleError } from '@/lib/utils/error-handler'
import { UserProfile } from '@/types/firestore'
import Image from 'next/image'

import { BarberLoginForm } from './BarberLoginForm'

interface BarberProfileSelectionProps {
  onBack: () => void
}

export function BarberProfileSelection({
  onBack,
}: BarberProfileSelectionProps) {
  const { data: barbers, isLoading, error } = useBarbers()
  const [selectedBarber, setSelectedBarber] = useState<UserProfile | null>(null)

  function handleBarberSelect(barber: UserProfile) {
    setSelectedBarber(barber)
  }

  function handleBackToSelection() {
    setSelectedBarber(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-primary" />
          <p className="text-gray-400">Loading barbers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Failed to load barbers</p>
        <button onClick={onBack} className="text-primary hover:underline">
          Go back
        </button>
      </div>
    )
  }

  if (selectedBarber) {
    return (
      <BarberLoginForm barber={selectedBarber} onBack={handleBackToSelection} />
    )
  }

  function handleKeyPress(event: React.KeyboardEvent, barber: UserProfile) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleBarberSelect(barber)
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-gray-400 hover:text-white transition-colors"
        aria-label="Back to role selection"
      >
        ← Back
      </button>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Select Your Profile
        </h2>
        <p className="text-gray-400">Choose your name to continue</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {barbers &&
          barbers.map((barber) => (
            <Card
              key={barber.id}
              role="button"
              tabIndex={0}
              onClick={() => handleBarberSelect(barber)}
              onKeyPress={(e) => handleKeyPress(e, barber)}
              aria-label={`Select barber: ${barber.username}`}
              className="
              cursor-pointer
              transition-all
              duration-200
              bg-[#1a1a1a]
              border-gray-800
              hover:shadow-lg
              hover:border-primary
              active:scale-98
              focus:outline-none
              focus:ring-2
              focus:ring-primary
            "
            >
              <CardHeader className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                  {barber.avatarUrl ? (
                    <Image
                      src={barber.avatarUrl!}
                      alt={barber.username}
                      width={64}
                      height={64}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <CardTitle className="text-lg text-white">
                  {barber.username}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
      </div>
    </div>
  )
}
