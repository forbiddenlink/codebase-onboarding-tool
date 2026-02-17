/**
 * CSRF Protection Middleware
 * 
 * Protects against Cross-Site Request Forgery attacks
 * 
 * NOTE: This is a placeholder implementation. For production use, consider:
 * - Implementing custom CSRF tokens with secure random generation
 * - Using Next.js middleware with token validation
 * - Leveraging SameSite cookies (already configured in next.config.js)
 */

import { NextRequest, NextResponse } from 'next/server';

// Paths to exclude from CSRF protection
const EXCLUDED_PATHS = [
  '/api/auth/callback', // OAuth callbacks
  '/api/webhooks',       // Webhooks from external services
];

/**
 * CSRF protection middleware
 * Validates CSRF tokens for state-changing requests (POST, PUT, DELETE, PATCH)
 * 
 * Currently relies on SameSite cookie protection.
 * TODO: Implement token-based CSRF protection for production
 */
export async function csrfMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Only validate on state-changing methods
  const method = request.method;
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null; // Continue without CSRF check
  }

  // Check if path is excluded
  const pathname = request.nextUrl.pathname;
  const isExcluded = EXCLUDED_PATHS.some(
    (prefix) => pathname.startsWith(prefix)
  );

  if (isExcluded) {
    return null; // Continue without CSRF check
  }

  // For now, CSRF protection relies on:
  // 1. SameSite=Strict cookies (configured in next.config.js headers)
  // 2. CORS configuration
  // 3. Origin header validation
  
  // Validate Origin/Referer header
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  if (origin || referer) {
    const requestOrigin = origin || (referer ? new URL(referer).origin : null);
    const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || `http://${host}`;
    
    if (requestOrigin && !requestOrigin.startsWith(expectedOrigin)) {
      console.warn(`[CSRF] Rejected request from unexpected origin: ${requestOrigin}`);
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }
  }

  return null; // Allow request
}

/**
 * Get CSRF token for client-side use
 * Call this from server components or API routes
 */
export function getCsrfToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('__Host-csrf-token')?.value;
    return token || null;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return null;
  }
}
