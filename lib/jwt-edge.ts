// Edge Runtime compatible JWT utilities for middleware
// Note: This provides basic JWT decoding without cryptographic verification
// Full verification happens in API routes using the main jwt.ts file

export interface JWTPayloadEdge {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token without verification (Edge Runtime compatible)
 * This is used in middleware for basic auth checks
 * Full verification happens in API routes
 */
export function decodeTokenUnsafe(token: string): JWTPayloadEdge | null {
  try {
    // JWT has 3 parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (base64url)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log('🕒 Edge: Token is expired');
      return null;
    }

    // Check if it has required fields
    if (!decoded.userId || !decoded.email || !decoded.role) {
      console.log('❌ Edge: Token missing required fields');
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    console.log('❌ Edge: Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired or will expire soon
 */
export function isTokenExpiringSoonEdge(token: string, bufferMinutes: number = 5): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) {
      return true;
    }

    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const bufferTime = bufferMinutes * 60 * 1000; // Convert minutes to milliseconds
    const now = Date.now();

    return (expirationTime - now) <= bufferTime;
  } catch (error) {
    return true;
  }
}
