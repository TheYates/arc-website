import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/redis';
import { authenticateRequest } from '@/lib/api/auth';

// GET /api/admin/rate-limit-monitor - Get rate limiting violations and statistics
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can view rate limit monitoring" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get recent violations
    const violations = await getRecentViolations(hours, limit);
    
    // Get rate limit statistics
    const stats = await getRateLimitStats(hours);
    
    // Get top violators
    const topViolators = await getTopViolators(hours);

    return NextResponse.json({
      success: true,
      data: {
        violations,
        stats,
        topViolators,
        timeRange: `${hours} hours`,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Rate limit monitoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rate limit data' },
      { status: 500 }
    );
  }
}

// POST /api/admin/rate-limit-monitor/clear - Clear rate limit violations (admin only)
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can clear rate limit data" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, targetIP, targetEndpoint } = body;

    if (action === 'clear_violations') {
      await clearViolations(targetIP, targetEndpoint);
      return NextResponse.json({
        success: true,
        message: 'Rate limit violations cleared'
      });
    }

    if (action === 'reset_limits') {
      await resetRateLimits(targetIP, targetEndpoint);
      return NextResponse.json({
        success: true,
        message: 'Rate limits reset'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Rate limit clear error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear rate limit data' },
      { status: 500 }
    );
  }
}

/**
 * Get recent rate limit violations
 */
async function getRecentViolations(hours: number, limit: number) {
  const violations = [];
  const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);

  try {
    // Get all violation keys (this is a simplified approach)
    // In production, you'd want to use a more efficient method
    const keys = await getAllViolationKeys();
    
    for (const key of keys.slice(0, limit)) {
      const violationData = await CacheService.get(key);
      if (violationData && typeof violationData === 'string') {
        try {
          const violation = JSON.parse(violationData);
          const violationTime = new Date(violation.timestamp).getTime();

          if (violationTime >= cutoffTime) {
            violations.push(violation);
          }
        } catch (error) {
          console.error('Failed to parse violation data:', error);
        }
      }
    }

    // Sort by timestamp (most recent first)
    violations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return violations;
  } catch (error) {
    console.error('Error fetching violations:', error);
    return [];
  }
}

/**
 * Get rate limiting statistics
 */
async function getRateLimitStats(hours: number) {
  try {
    const violations = await getRecentViolations(hours, 1000);
    
    const stats: {
      totalViolations: number;
      uniqueIPs: number;
      uniqueEndpoints: number;
      violationsByEndpoint: Record<string, number>;
      violationsByHour: Record<number, number>;
      topUserAgents: Record<string, number>;
    } = {
      totalViolations: violations.length,
      uniqueIPs: new Set(violations.map((v: any) => v.ip)).size,
      uniqueEndpoints: new Set(violations.map((v: any) => v.endpoint)).size,
      violationsByEndpoint: {},
      violationsByHour: {},
      topUserAgents: {}
    };

    // Group violations by endpoint
    violations.forEach((violation: any) => {
      const endpoint = violation.endpoint;
      stats.violationsByEndpoint[endpoint] = (stats.violationsByEndpoint[endpoint] || 0) + 1;
    });

    // Group violations by hour
    violations.forEach((violation: any) => {
      const hour = new Date(violation.timestamp).getHours();
      stats.violationsByHour[hour] = (stats.violationsByHour[hour] || 0) + 1;
    });

    // Top user agents
    violations.forEach((violation: any) => {
      const ua = violation.userAgent || 'unknown';
      stats.topUserAgents[ua] = (stats.topUserAgents[ua] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      totalViolations: 0,
      uniqueIPs: 0,
      uniqueEndpoints: 0,
      violationsByEndpoint: {},
      violationsByHour: {},
      topUserAgents: {}
    };
  }
}

/**
 * Get top violators by IP address
 */
async function getTopViolators(hours: number) {
  try {
    const violations = await getRecentViolations(hours, 1000);
    const violatorCounts: Record<string, {
      ip: string;
      count: number;
      endpoints: Set<string>;
      firstViolation: string;
      lastViolation: string;
    }> = {};

    violations.forEach((violation: any) => {
      const ip = violation.ip;
      if (!violatorCounts[ip]) {
        violatorCounts[ip] = {
          ip,
          count: 0,
          endpoints: new Set(),
          firstViolation: violation.timestamp,
          lastViolation: violation.timestamp
        };
      }

      violatorCounts[ip].count++;
      violatorCounts[ip].endpoints.add(violation.endpoint);

      if (new Date(violation.timestamp) < new Date(violatorCounts[ip].firstViolation)) {
        violatorCounts[ip].firstViolation = violation.timestamp;
      }

      if (new Date(violation.timestamp) > new Date(violatorCounts[ip].lastViolation)) {
        violatorCounts[ip].lastViolation = violation.timestamp;
      }
    });

    // Convert sets to arrays and sort by count
    const topViolators = Object.values(violatorCounts)
      .map(violator => ({
        ip: violator.ip,
        count: violator.count,
        firstViolation: violator.firstViolation,
        lastViolation: violator.lastViolation,
        endpoints: Array.from(violator.endpoints)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return topViolators;
  } catch (error) {
    console.error('Error getting top violators:', error);
    return [];
  }
}

/**
 * Get all violation keys (simplified implementation)
 */
async function getAllViolationKeys(): Promise<string[]> {
  // This is a simplified implementation
  // In production, you'd want to use Redis SCAN or maintain an index
  try {
    // For now, return empty array - this would need Redis KEYS command
    // which is not ideal for production
    return [];
  } catch (error) {
    console.error('Error getting violation keys:', error);
    return [];
  }
}

/**
 * Clear rate limit violations
 */
async function clearViolations(targetIP?: string, targetEndpoint?: string) {
  try {
    // Implementation would depend on your Redis structure
    // This is a placeholder for the actual implementation
    console.log(`Clearing violations for IP: ${targetIP}, Endpoint: ${targetEndpoint}`);
  } catch (error) {
    console.error('Error clearing violations:', error);
  }
}

/**
 * Reset rate limits for specific IP/endpoint
 */
async function resetRateLimits(targetIP?: string, targetEndpoint?: string) {
  try {
    // Implementation would clear the rate limit counters
    // This is a placeholder for the actual implementation
    console.log(`Resetting rate limits for IP: ${targetIP}, Endpoint: ${targetEndpoint}`);
  } catch (error) {
    console.error('Error resetting rate limits:', error);
  }
}
