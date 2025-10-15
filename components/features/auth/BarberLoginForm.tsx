'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { signInAsBarber } from '@/lib/services/auth'
import { useAuthStore } from '@/stores/authStore'
import { handleError } from '@/lib/utils/error-handler'
import { loginSchema, type LoginInput } from '@/lib/validations/schemas'
import { toast } from 'sonner'
import { UserProfile } from '@/types/firestore'

interface BarberLoginFormProps {
  barber: UserProfile
  onBack: () => void
}

export function BarberLoginForm({ barber, onBack }: BarberLoginFormProps) {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: barber.email,
      password: '',
    },
  })

  async function handleBarberLogin(data: LoginInput) {
    setLoading(true)
    try {
      const authenticatedBarber = await signInAsBarber(barber.id, data.password)
      login(authenticatedBarber)
      toast.success(`Welcome back, ${barber.username}!`)
      router.push('/barber/dashboard')
    } catch (error) {
      handleError(error, 'BarberLoginForm.handleBarberLogin')
      toast.error('Invalid password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-gray-400 hover:text-white"
        disabled={loading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to profile selection
      </Button>

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome, {barber.username}
        </h2>
        <p className="text-gray-400 mb-6">Enter your password to sign in.</p>

        <form onSubmit={handleSubmit(handleBarberLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              disabled={loading}
              className="bg-[#0a0a0a] border-gray-800 text-white"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
