'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuthStore } from '@/stores/authStore'
import { signOut } from '@/lib/services/auth'
import { handleError } from '@/lib/utils/error-handler'
import { toast } from 'sonner'

interface NavigationProps {
  role: 'manager' | 'barber'
}

/**
 * Navigation Component
 *
 * Horizontal navigation bar with responsive mobile menu.
 * Features:
 * - Active link highlighting with primary color
 * - Hamburger menu for mobile (<768px)
 * - Logout button
 * - Role-based navigation links
 */
export function Navigation({ role }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const managerLinks = [
    { href: '/manager/dashboard', label: 'Dashboard' },
    { href: '/manager/barbers', label: 'Barbers' },
    { href: '/manager/services', label: 'Services' },
    { href: '/manager/inventory', label: 'Inventory' },
    { href: '/manager/reports', label: 'Reports' },
  ]

  const barberLinks = [{ href: '/barber/dashboard', label: 'Dashboard' }]

  const links = role === 'manager' ? managerLinks : barberLinks

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await signOut()
      logout()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      handleError(error, 'Navigation.handleLogout')
    } finally {
      setIsLoggingOut(false)
    }
  }

  function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
    return (
      <>
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={`
                px-3 py-2 text-sm font-medium transition-colors rounded-md
                ${
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-white'
                }
              `}
            >
              {link.label}
            </Link>
          )
        })}
      </>
    )
  }

  return (
    <nav className="bg-[#1a1a1a] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-white">SalonFlow</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <NavLinks />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-[#1a1a1a] border-gray-800"
              >
                <SheetHeader>
                  <SheetTitle className="text-white">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  <NavLinks onLinkClick={() => setMobileMenuOpen(false)} />
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-gray-400 hover:text-white justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
