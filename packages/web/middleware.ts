/**
 * Next.js Middleware
 * 
 * Runs on every request to apply:
 * - CSRF protection
 * - Request logging
 * - Additional security checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { csrfMiddleware } from './lib/csrf';

export async function middleware(request: NextRequest) {
  // Apply CSRF protection
  const csrfResponse = await csrfMiddleware(request);
  if (csrfResponse) {
    return csrfResponse; // CSRF validation failed
  }

  // Log API requests in development
  if (process.env.NODE_ENV === 'development' && request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`[API] ${request.method} ${request.nextUrl.pathname}`);
  }

  // Continue to the requested page/API route
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
