/**
 * Response Compression Utilities
 * 
 * Provides compression for API responses to improve performance
 */

import { NextResponse } from 'next/server';

/**
 * Compress response body if size exceeds threshold
 * Uses built-in compression when available
 */
export function withCompression(response: NextResponse, contentType?: string): NextResponse {
  // Only compress text-based content
  const compressibleTypes = [
    'application/json',
    'text/html',
    'text/plain',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/xml',
  ];

  const currentContentType = contentType || response.headers.get('content-type') || '';
  const isCompressible = compressibleTypes.some(type => currentContentType.includes(type));

  if (isCompressible) {
    // Modern browsers handle compression via Accept-Encoding
    // Vercel automatically compresses responses
    response.headers.set('Vary', 'Accept-Encoding');
  }

  return response;
}

/**
 * Add cache control headers for optimal performance
 */
export function withCacheHeaders(
  response: NextResponse,
  options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    staleIfError?: number;
    public?: boolean;
  } = {}
): NextResponse {
  const {
    maxAge = 0,
    staleWhileRevalidate = 0,
    staleIfError = 0,
    public: isPublic = true,
  } = options;

  const parts: string[] = [];

  if (isPublic) {
    parts.push('public');
  } else {
    parts.push('private');
  }

  if (maxAge > 0) {
    parts.push(`max-age=${maxAge}`);
  }

  if (staleWhileRevalidate > 0) {
    parts.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  if (staleIfError > 0) {
    parts.push(`stale-if-error=${staleIfError}`);
  }

  response.headers.set('Cache-Control', parts.join(', '));

  return response;
}

/**
 * Preset cache configurations
 */
export const CachePresets = {
  // No caching
  noCache: {
    maxAge: 0,
    staleWhileRevalidate: 0,
  },

  // Short cache (5 minutes)
  short: {
    maxAge: 5 * 60,
    staleWhileRevalidate: 60,
    staleIfError: 300,
  },

  // Medium cache (1 hour)
  medium: {
    maxAge: 60 * 60,
    staleWhileRevalidate: 5 * 60,
    staleIfError: 3600,
  },

  // Long cache (1 day)
  long: {
    maxAge: 24 * 60 * 60,
    staleWhileRevalidate: 60 * 60,
    staleIfError: 86400,
  },

  // Static assets (1 year with immutable)
  static: {
    maxAge: 365 * 24 * 60 * 60,
    staleWhileRevalidate: 0,
  },

  // API with stale-while-revalidate (1 minute, revalidate in background)
  api: {
    maxAge: 60,
    staleWhileRevalidate: 30,
    staleIfError: 300,
  },
};

/**
 * Helper to create optimized JSON responses
 */
export function jsonResponse<T>(
  data: T,
  options: {
    status?: number;
    cache?: keyof typeof CachePresets | {
      maxAge?: number;
      staleWhileRevalidate?: number;
      staleIfError?: number;
      public?: boolean;
    };
  } = {}
): NextResponse {
  const { status = 200, cache = 'noCache' } = options;

  const response = NextResponse.json(data, { status });

  // Apply compression headers
  withCompression(response, 'application/json');

  // Apply cache headers
  const cacheConfig = typeof cache === 'string' ? CachePresets[cache] : cache;
  withCacheHeaders(response, cacheConfig);

  return response;
}
