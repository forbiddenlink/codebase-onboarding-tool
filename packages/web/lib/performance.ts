/**
 * Performance Monitoring Utilities
 * 
 * Tracks API response times and cache hit rates
 */

interface PerformanceMetrics {
  endpoint: string;
  duration: number;
  cached: boolean;
  timestamp: Date;
  statusCode: number;
}

// In-memory metrics storage (would use Redis or DB in production)
const metricsStore: PerformanceMetrics[] = [];
const MAX_METRICS = 1000;

/**
 * Log performance metrics for an API call
 */
export function logPerformance(metrics: PerformanceMetrics): void {
  metricsStore.push(metrics);
  
  // Keep only recent metrics
  if (metricsStore.length > MAX_METRICS) {
    metricsStore.shift();
  }

  // Log slow requests (> 1 second)
  if (metrics.duration > 1000 && !metrics.cached) {
    console.warn(`[SLOW REQUEST] ${metrics.endpoint} took ${metrics.duration}ms`);
  }

  // Log cache performance
  if (process.env.NODE_ENV === 'development') {
    const cacheStatus = metrics.cached ? '✓ CACHED' : '✗ FRESH';
    console.log(`[PERF] ${cacheStatus} ${metrics.endpoint} ${metrics.duration}ms`);
  }
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  if (metricsStore.length === 0) {
    return {
      totalRequests: 0,
      avgDuration: 0,
      cacheHitRate: 0,
      slowRequests: 0,
    };
  }

  const totalRequests = metricsStore.length;
  const cachedRequests = metricsStore.filter(m => m.cached).length;
  const slowRequests = metricsStore.filter(m => m.duration > 1000).length;
  const totalDuration = metricsStore.reduce((sum, m) => sum + m.duration, 0);

  return {
    totalRequests,
    avgDuration: Math.round(totalDuration / totalRequests),
    cacheHitRate: Math.round((cachedRequests / totalRequests) * 100),
    slowRequests,
  };
}

/**
 * Timing helper for async operations
 */
export async function measurePerformance<T>(
  endpoint: string,
  operation: () => Promise<T>,
  options: { cached?: boolean } = {}
): Promise<T> {
  const start = Date.now();
  let statusCode = 200;

  try {
    const result = await operation();
    return result;
  } catch (error) {
    statusCode = error instanceof Error && 'status' in error ? (error as any).status : 500;
    throw error;
  } finally {
    const duration = Date.now() - start;
    logPerformance({
      endpoint,
      duration,
      cached: options.cached || false,
      timestamp: new Date(),
      statusCode,
    });
  }
}

/**
 * Get metrics for a specific time window
 */
export function getMetricsByTimeWindow(minutes: number = 5) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  return metricsStore.filter(m => m.timestamp >= cutoff);
}

/**
 * Get slowest endpoints
 */
export function getSlowestEndpoints(limit: number = 10) {
  const endpointStats = new Map<string, { count: number; totalDuration: number }>();

  metricsStore.forEach(metric => {
    const stats = endpointStats.get(metric.endpoint) || { count: 0, totalDuration: 0 };
    stats.count += 1;
    stats.totalDuration += metric.duration;
    endpointStats.set(metric.endpoint, stats);
  });

  return Array.from(endpointStats.entries())
    .map(([endpoint, stats]) => ({
      endpoint,
      avgDuration: Math.round(stats.totalDuration / stats.count),
      count: stats.count,
    }))
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, limit);
}
