/**
 * GET /api/performance
 * Get performance metrics and cache statistics
 */

import { NextResponse } from 'next/server';
import { getPerformanceStats, getSlowestEndpoints, getMetricsByTimeWindow } from '@/lib/performance';

export async function GET() {
  try {
    const stats = getPerformanceStats();
    const slowest = getSlowestEndpoints(5);
    const recentMetrics = getMetricsByTimeWindow(5);

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        recentRequests: recentMetrics.length,
      },
      slowestEndpoints: slowest,
      uptime: process.uptime(),
      memoryUsage: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance metrics' },
      { status: 500 }
    );
  }
}
