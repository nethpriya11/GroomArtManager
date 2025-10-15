'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { useState } from 'react'

/**
 * Client-side providers for the application
 *
 * Wraps the app with React Query for server state management
 * and Sonner for toast notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside component to avoid sharing between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Real-time data is always fresh from Firestore listeners
            staleTime: Infinity,
            // Keep unused data in cache for 5 minutes
            gcTime: 1000 * 60 * 5,
            // onSnapshot handles updates, no need to refetch on window focus
            refetchOnWindowFocus: false,
            // Retry failed queries 3 times with exponential backoff
            retry: 3,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
      {/* Show React Query DevTools in development only */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
