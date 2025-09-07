import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, RateLimitConfigs } from '@/lib/middleware/rate-limit';

// Test endpoint for rate limiting
export async function GET(request: NextRequest) {
  // Apply rate limiting - 5 requests per minute for testing
  const testConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Rate limit test: Too many requests. Try again in 1 minute.'
  };

  const rateLimitResponse = await applyRateLimit(request, testConfig);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // If not rate limited, return success
  return NextResponse.json({
    success: true,
    message: 'Request successful',
    timestamp: new Date().toISOString(),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  });
}

export async function POST(request: NextRequest) {
  // Apply stricter rate limiting for POST requests
  const testConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3,
    message: 'Rate limit test: Too many POST requests. Try again in 1 minute.'
  };

  const rateLimitResponse = await applyRateLimit(request, testConfig);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    message: 'POST request successful',
    timestamp: new Date().toISOString(),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    body
  });
}
