/**
 * Rate Limiting Utilities
 * 
 * Provides rate limiting for API routes using Upstash Redis.
 * Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Create Redis instance (will use env vars automatically)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limiters for different endpoints
export const rateLimiters = {
  // AI endpoints: 10 requests per minute
  ai: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit:ai',
  }) : null,

  // Auth endpoints: 5 requests per minute (prevent brute force)
  auth: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit:auth',
  }) : null,

  // Repository endpoints: 30 requests per minute
  repository: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit:repository',
  }) : null,

  // General API: 60 requests per minute
  general: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit:general',
  }) : null,
};

/**
 * Get client identifier from request
 * Uses IP address or user ID from headers
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from headers (for proxied requests)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  
  // Could also use user ID from auth headers if available
  const userId = request.headers.get('x-user-id');
  
  return userId || ip;
}

/**
 * Apply rate limiting to a request
 * Returns NextResponse with 429 if rate limit exceeded
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: Ratelimit | null,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // If rate limiting not configured, allow request
  if (!limiter) {
    console.warn('Rate limiting not configured - skipping');
    return handler();
  }

  const identifier = getClientIdentifier(request);
  
  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    // Add rate limit headers to response
    const response = success 
      ? await handler()
      : NextResponse.json(
          { error: 'Too many requests', retryAfter: Math.ceil((reset - Date.now()) / 1000) },
          { status: 429 }
        );

    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());

    return response;
  } catch (error) {
    // If rate limiting fails, log error but allow request
    console.error('Rate limiting error:', error);
    return handler();
  }
}

/**
 * Higher-order function to wrap API route with rate limiting
 */
export function rateLimit(limiter: Ratelimit | null) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
      return withRateLimit(req, limiter, () => handler(req));
    };
  };
}
