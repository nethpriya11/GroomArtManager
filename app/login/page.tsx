'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { BarberProfileSelection } from '@/components/features/auth/BarberProfileSelection'
import { signInWithCredentials } from '@/lib/services/auth'
import { useAuthStore } from '@/stores/authStore'
import { handleError } from '@/lib/utils/error-handler'
import { loginSchema, type LoginInput } from '@/lib/validations/schemas'
import { toast } from 'sonner'

/**
 * Login page for role selection
 *
 * Users select whether they are a Manager or Barber.
 * - Manager: Shows login form requiring email and password
 * - Barber: Shows barber selection view to choose specific barber profile
 */
export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<
    'role-selection' | 'manager-login' | 'barber-selection'
  >('role-selection')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  /**
   * Handle Manager login form submission
   *
   * Authenticates manager with email and password and redirects to manager dashboard.
   */
  async function handleManagerLogin(data: Omit<LoginInput, 'email'>) {
    setLoading(true)
    try {
      const user = await signInAsManager()

      if (user.role !== 'manager') {
        toast.error('Invalid credentials. Please use manager account.')
        return
      }

      login(user)
      toast.success('Welcome back!')
      router.push('/manager/dashboard')
    } catch (error) {
      handleError(error, 'LoginPage.handleManagerLogin')
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle Manager button click
   *
   * Navigate to manager login form view.
   */
  function handleManagerClick() {
    setView('manager-login')
  }

  /**
   * Handle Barber button click
   *
   * Navigate to barber selection view.
   */
  function handleBarberClick() {
    setView('barber-selection')
  }

  /**
   * Handle back button click
   *
   * Return to role selection view.
   */
  function handleBackClick() {
    setView('role-selection')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-10">
        {/* Branding */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white animate-fade-in-down">
            SalonFlow
          </h1>
          <p className="text-gray-400 text-lg">
            Commission Tracking Made Simple
          </p>
        </div>

        {view === 'role-selection' ? (
          /* Role Selection View */
          <div className="space-y-6">
            {/* Manager Button */}
            <Button
              className="w-full h-16 text-lg bg-gray-800/50 border-gray-700 hover:bg-primary/80 hover:text-white transition-all duration-300 transform hover:scale-105"
              variant="outline"
              size="lg"
              onClick={handleManagerClick}
              disabled={loading}
              aria-label="Login as Manager"
            >
              <div className="flex items-center gap-3">
                <User className="h-6 w-6" />
                <span>Manager</span>
              </div>
            </Button>

            {/* Barber Button */}
            <Button
              className="w-full h-16 text-lg bg-gray-800/50 border-gray-700 hover:bg-primary/80 hover:text-white transition-all duration-300 transform hover:scale-105"
              variant="outline"
              size="lg"
              onClick={handleBarberClick}
              disabled={loading}
              aria-label="Login as Barber"
            >
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                <span>Barber</span>
              </div>
            </Button>
          </div>
        ) : view === 'manager-login' ? (
          /* Manager Login Form */
          <div className="space-y-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {/* Login Form */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white mb-6">
                Manager Login
              </h2>

              <form
                onSubmit={handleSubmit(handleManagerLogin)}
                className="space-y-6"
              >
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...register('password')}
                    disabled={loading}
                    className="bg-gray-800/60 border-gray-700 text-white h-12 text-base"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 pt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-white font-bold transition-all duration-300 transform hover:scale-105"
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

              {/* Helper Text */}
              <p className="mt-6 text-xs text-gray-500 text-center">
                Default credentials: manager@salonflow.com / manager123
              </p>
            </div>
          </div>
        ) : (
          /* Barber Selection View */
          <BarberProfileSelection onBack={handleBackClick} />
        )}

        {/* Footer Text */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Tap your role to continue</p>
        </div>
      </div>
    </div>
  )
}
