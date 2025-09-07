import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/redis';

export interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Maximum requests in window
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
  headers?: boolean;    // Include rate limit headers in response
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

/**
 * Advanced rate limiting with Redis backend
 * Supports sliding window, different limits per endpoint, and comprehensive logging
 */
export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      headers: true,
      message: 'Too many requests, please try again later.',
      ...config
    };
  }

  /**
   * Check if request should be rate limited
   */
  async checkLimit(request: NextRequest, identifier?: string): Promise<RateLimitResult> {
    const key = this.generateKey(request, identifier);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Get current count for this window
      const currentCount = await this.getCurrentCount(key, windowStart, now);
      
      // Calculate remaining requests
      const remaining = Math.max(0, this.config.maxRequests - currentCount - 1);
      const resetTime = now + this.config.windowMs;

      // Check if limit exceeded
      if (currentCount >= this.config.maxRequests) {
        // Log rate limit violation
        await this.logViolation(key, request, currentCount);
        
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime,
          totalHits: currentCount
        };
      }

      // Increment counter
      await this.incrementCounter(key, now, this.config.windowMs);

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining,
        resetTime,
        totalHits: currentCount + 1
      };

    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request if rate limiting fails
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        totalHits: 0
      };
    }
  }

  /**
   * Generate cache key for rate limiting
   */
  private generateKey(request: NextRequest, identifier?: string): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }

    if (identifier) {
      return `rate_limit:${identifier}`;
    }

    // Default: use IP + endpoint
    const ip = this.getClientIP(request);
    const endpoint = new URL(request.url).pathname;
    return `rate_limit:${ip}:${endpoint}`;
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    // Check various headers for real IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    // Fallback to unknown IP
    return 'unknown';
  }

  /**
   * Get current request count in sliding window
   */
  private async getCurrentCount(key: string, windowStart: number, now: number): Promise<number> {
    // Use Redis sorted set for sliding window
    const countKey = `${key}:count`;
    
    // Remove old entries outside window
    await CacheService.zremrangebyscore(countKey, 0, windowStart);
    
    // Count current entries in window
    const count = await CacheService.zcard(countKey);
    
    return count || 0;
  }

  /**
   * Increment request counter
   */
  private async incrementCounter(key: string, timestamp: number, windowMs: number): Promise<void> {
    const countKey = `${key}:count`;
    
    // Add current request to sorted set
    await CacheService.zadd(countKey, timestamp, `${timestamp}-${Math.random()}`);
    
    // Set expiration for cleanup
    await CacheService.expire(countKey, Math.ceil(windowMs / 1000) + 60);
  }

  /**
   * Log rate limit violation for monitoring
   */
  private async logViolation(key: string, request: NextRequest, count: number): Promise<void> {
    const violation = {
      timestamp: new Date().toISOString(),
      key,
      ip: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      endpoint: new URL(request.url).pathname,
      method: request.method,
      count,
      limit: this.config.maxRequests
    };

    // Log to console (in production, send to monitoring service)
    console.warn('🚨 Rate limit violation:', violation);

    // Store violation for monitoring dashboard
    const violationKey = `rate_limit_violations:${Date.now()}`;
    await CacheService.set(violationKey, JSON.stringify(violation), 86400); // 24 hours
  }

  /**
   * Create rate limit response with headers
   */
  createLimitResponse(result: RateLimitResult): NextResponse {
    const response = NextResponse.json(
      { 
        error: this.config.message,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      },
      { status: 429 }
    );

    if (this.config.headers) {
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString());
    }

    return response;
  }

  /**
   * Add rate limit headers to successful response
   */
  addHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
    if (this.config.headers) {
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    }
    return response;
  }
}

/**
 * Predefined rate limit configurations for different endpoint types
 */
export const RateLimitConfigs = {
  // Authentication endpoints - strict limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  },

  // Admin login - very strict
  adminAuth: {
    windowMs: 15 * 60 * 1000, // 15 minutes  
    maxRequests: 3,
    message: 'Too many admin login attempts. Please try again in 15 minutes.'
  },

  // CRUD operations - moderate limits
  crud: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many requests. Please slow down.'
  },

  // Bulk operations - strict limits
  bulk: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many bulk operations. Please try again later.'
  },

  // Read operations - generous limits
  read: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please slow down.'
  },

  // Password reset - strict limits
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts. Please try again in 1 hour.'
  }
};

/**
 * Convenience function to apply rate limiting to API routes
 */
export async function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): Promise<NextResponse | null> {
  const limiter = new RateLimiter(config);
  const result = await limiter.checkLimit(request, identifier);

  if (!result.success) {
    return limiter.createLimitResponse(result);
  }

  return null; // Allow request to proceed
}

/**
 * Rate limiting decorator for API routes
 */
export function withRateLimit(config: RateLimitConfig) {
  return function(handler: Function) {
    return async function(request: NextRequest, ...args: any[]) {
      const limitResponse = await applyRateLimit(request, config);
      if (limitResponse) {
        return limitResponse;
      }
      return handler(request, ...args);
    };
  };
}
