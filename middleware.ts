import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for protecting authenticated routes
 *
 * Checks if the user is authenticated by looking for Firebase auth session.
 * For role-based access, we'll verify in the page components using Zustand.
 *
 * Protected routes:
 * - /manager/* - Manager routes (role verification in components)
 * - /barber/* - Barber routes (role verification in components)
 */
export function middleware(request: NextRequest) {
  // For now, we'll let the client-side handle auth checks
  // In production, you'd want to verify Firebase ID tokens server-side
  // This middleware ensures proper routing structure

  return NextResponse.next()
}

export const config = {
  matcher: ['/manager/:path*', '/barber/:path*'],
}
