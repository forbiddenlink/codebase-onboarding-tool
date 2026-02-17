/**
 * AI Response Caching
 * 
 * Caches AI responses to reduce API costs and improve performance
 * Uses Upstash Redis if configured, otherwise falls back to in-memory cache
 */

import { Redis } from '@upstash/redis';
import crypto from 'crypto';

// Initialize Redis client if configured
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// In-memory cache fallback (for development)
const memoryCache = new Map<string, { data: unknown; expiry: number }>();

// Cache configuration
const CACHE_CONFIG = {
  // TTL for different types of AI responses (in seconds)
  ttl: {
    explain: 7 * 24 * 60 * 60,    // 7 days (code explanations are stable)
    analyze: 24 * 60 * 60,         // 1 day (analysis may need updates)
    suggest: 60 * 60,              // 1 hour (suggestions may change frequently)
  },
  
  // Key prefix
  prefix: 'codecompass:ai:',
};

/**
 * Generate cache key from input parameters
 */
function generateCacheKey(type: string, params: Record<string, unknown>): string {
  // Sort keys for consistent hashing
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, unknown>);

  // Hash the parameters
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(sortedParams))
    .digest('hex')
    .substring(0, 16);

  return `${CACHE_CONFIG.prefix}${type}:${hash}`;
}

/**
 * Get cached response
 */
export async function getCachedResponse<T>(
  type: 'explain' | 'analyze' | 'suggest',
  params: Record<string, unknown>
): Promise<T | null> {
  const key = generateCacheKey(type, params);

  try {
    if (redis) {
      // Use Redis cache
      const cached = await redis.get<T>(key);
      if (cached) {
        console.log(`[Cache HIT] ${type}:${key.substring(0, 24)}...`);
        return cached;
      }
    } else {
      // Use memory cache
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        console.log(`[Cache HIT] ${type}:${key.substring(0, 24)}...`);
        return cached.data as T;
      } else if (cached) {
        // Remove expired entry
        memoryCache.delete(key);
      }
    }
  } catch (error) {
    console.error('[Cache ERROR] Failed to get cached response:', error);
  }

  console.log(`[Cache MISS] ${type}:${key.substring(0, 24)}...`);
  return null;
}

/**
 * Cache AI response
 */
export async function cacheResponse<T>(
  type: 'explain' | 'analyze' | 'suggest',
  params: Record<string, unknown>,
  data: T
): Promise<void> {
  const key = generateCacheKey(type, params);
  const ttl = CACHE_CONFIG.ttl[type];

  try {
    if (redis) {
      // Use Redis cache with TTL
      await redis.set(key, data, { ex: ttl });
      console.log(`[Cache SET] ${type}:${key.substring(0, 24)}... (TTL: ${ttl}s)`);
    } else {
      // Use memory cache with expiry
      memoryCache.set(key, {
        data,
        expiry: Date.now() + ttl * 1000,
      });
      console.log(`[Cache SET] ${type}:${key.substring(0, 24)}... (TTL: ${ttl}s)`);
      
      // Clean up expired entries periodically
      if (memoryCache.size > 100) {
        cleanupMemoryCache();
      }
    }
  } catch (error) {
    console.error('[Cache ERROR] Failed to cache response:', error);
  }
}

/**
 * Invalidate cache for specific type and params
 */
export async function invalidateCache(
  type: 'explain' | 'analyze' | 'suggest',
  params: Record<string, unknown>
): Promise<void> {
  const key = generateCacheKey(type, params);

  try {
    if (redis) {
      await redis.del(key);
    } else {
      memoryCache.delete(key);
    }
    console.log(`[Cache DELETE] ${type}:${key.substring(0, 24)}...`);
  } catch (error) {
    console.error('[Cache ERROR] Failed to invalidate cache:', error);
  }
}

/**
 * Clear all cache entries
 */
export async function clearAllCache(): Promise<void> {
  try {
    if (redis) {
      // Scan and delete all keys with prefix
      const keys = await redis.keys(`${CACHE_CONFIG.prefix}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      console.log(`[Cache CLEAR] Deleted ${keys.length} entries`);
    } else {
      memoryCache.clear();
      console.log('[Cache CLEAR] Cleared memory cache');
    }
  } catch (error) {
    console.error('[Cache ERROR] Failed to clear cache:', error);
  }
}

/**
 * Clean up expired entries from memory cache
 */
function cleanupMemoryCache(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of memoryCache.entries()) {
    if (value.expiry <= now) {
      memoryCache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Cache CLEANUP] Removed ${cleaned} expired entries`);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  type: 'redis' | 'memory';
  size: number;
  enabled: boolean;
}> {
  if (redis) {
    try {
      const keys = await redis.keys(`${CACHE_CONFIG.prefix}*`);
      return {
        type: 'redis',
        size: keys.length,
        enabled: true,
      };
    } catch (error) {
      console.error('[Cache ERROR] Failed to get Redis stats:', error);
      return { type: 'redis', size: 0, enabled: false };
    }
  } else {
    return {
      type: 'memory',
      size: memoryCache.size,
      enabled: true,
    };
  }
}
