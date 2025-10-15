import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Loading spinner component
 *
 * Displays an animated spinner icon for loading states.
 *
 * @example
 * ```tsx
 * <Spinner size="md" className="text-primary" />
 * ```
 */
export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <Loader2
      className={cn('animate-spin', sizeClasses[size], className)}
      aria-label="Loading"
    />
  )
}
