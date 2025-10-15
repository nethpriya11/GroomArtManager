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
import { BarberProfileSelection } from '@/components/features/auth/BarberProfileSelection'
import { signInWithCredentials, signInWithGoogle } from '@/lib/services/auth'
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
  async function handleManagerLogin(data: LoginInput) {
    setLoading(true)
    try {
      const user = await signInWithCredentials(data.email, data.password)

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
   * Handle Google login
   *
   * Authenticates user with Google and redirects to appropriate dashboard.
   */
  async function handleGoogleLogin() {
    setLoading(true)
    try {
      const user = await signInWithGoogle()

      login(user)
      toast.success('Welcome back!')
      if (user.role === 'manager') {
        router.push('/manager/dashboard')
      } else if (user.role === 'barber') {
        router.push('/barber/dashboard')
      } else {
        // Handle other roles or default redirect
        router.push('/')
      }
    } catch (error) {
      handleError(error, 'LoginPage.handleGoogleLogin')
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

            {/* Google Sign-In Button */}
            <Button
              className="w-full h-16 text-lg bg-blue-600/50 border-blue-700 hover:bg-blue-700/80 hover:text-white transition-all duration-300 transform hover:scale-105"
              variant="outline"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={loading}
              aria-label="Sign in with Google"
            >
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37.5 24 37.5c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 12.9 2 3.5 11.4 3.5 22.5S12.9 43 24 43c10.6 0 19.2-7.8 19.2-19.5 0-1.3-.2-2.6-.4-3.8z" fill="#FFC107"/>
                  <path d="M6.5 24.5c0-1.6.3-3.2.8-4.7l-5.2-4C1.1 18.3 0 21.3 0 24.5c0 3.2 1.1 6.2 3.1 8.8l5.2-4c-.5-1.5-.8-3.1-.8-4.8z" fill="#FF3D00"/>
                  <path d="M24 43c-4.7 0-9-1.4-12.7-3.8l-5.2 4c3.8 2.9 8.6 4.7 12.9 4.7 10.6 0 19.2-7.8 19.2-19.5 0-1.3-.2-2.6-.4-3.8l-6.4 6.4c.2 1.2.4 2.4.4 3.8 0 5.2-4.2 9.5-9.5 9.5z" fill="#4CAF50"/>
                  <path d="M44.5 20H24v8.5h11.8c-.7 4.6-5.2 8.1-11.8 8.1-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 12.9 2 3.5 11.4 3.5 22.5S12.9 43 24 43c10.6 0 19.2-7.8 19.2-19.5 0-1.3-.2-2.6-.4-3.8z" fill="#1976D2"/>
                </svg>
                <span>Sign in with Google</span>
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
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="manager@salonflow.com"
                    {...register('email')}
                    disabled={loading}
                    className="bg-gray-800/60 border-gray-700 text-white h-12 text-base"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 pt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

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
  async function handleManagerLogin(data: LoginInput) {
    setLoading(true)
    try {
      const user = await signInWithCredentials(data.email, data.password)

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

            {/* Google Sign-In Button */}
            <Button
              className="w-full h-16 text-lg bg-blue-600/50 border-blue-700 hover:bg-blue-700/80 hover:text-white transition-all duration-300 transform hover:scale-105"
              variant="outline"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={loading}
              aria-label="Sign in with Google"
            >
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37.5 24 37.5c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 12.9 2 3.5 11.4 3.5 22.5S12.9 43 24 43c10.6 0 19.2-7.8 19.2-19.5 0-1.3-.2-2.6-.4-3.8z" fill="#FFC107"/>
                  <path d="M6.5 24.5c0-1.6.3-3.2.8-4.7l-5.2-4C1.1 18.3 0 21.3 0 24.5c0 3.2 1.1 6.2 3.1 8.8l5.2-4c-.5-1.5-.8-3.1-.8-4.8z" fill="#FF3D00"/>
                  <path d="M24 43c-4.7 0-9-1.4-12.7-3.8l-5.2 4c3.8 2.9 8.6 4.7 12.9 4.7 10.6 0 19.2-7.8 19.2-19.5 0-1.3-.2-2.6-.4-3.8l-6.4 6.4c.2 1.2.4 2.4.4 3.8 0 5.2-4.2 9.5-9.5 9.5z" fill="#4CAF50"/>
                  <path d="M44.5 20H24v8.5h11.8c-.7 4.6-5.2 8.1-11.8 8.1-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 12.9 2 3.5 11.4 3.5 22.5S12.9 43 24 43c10.6 0 19.2-7.8 19.2-19.5 0-1.3-.2-2.6-.4-3.8z" fill="#1976D2"/>
                </svg>
                <span>Sign in with Google</span>
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
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="manager@salonflow.com"
                    {...register('email')}
                    disabled={loading}
                    className="bg-gray-800/60 border-gray-700 text-white h-12 text-base"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 pt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

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
