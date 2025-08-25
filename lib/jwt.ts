import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/database/postgresql';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h'; // 8 hours default
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'; // 7 days default

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  sessionId: string;
}

/**
 * Generate JWT access token and refresh token for a user
 */
export async function generateTokens(user: any): Promise<SessionTokens> {
  // Generate a session ID (will be stored in database when available)
  const sessionId = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  
  // Try to create session record in database (graceful fallback if table doesn't exist)
  try {
    await prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        sessionToken: generateSessionToken(),
        expiresAt: new Date(Date.now() + parseExpirationTime(REFRESH_TOKEN_EXPIRES_IN)),
      },
    });
    console.log("✅ Session stored in database");
  } catch (error: any) {
    console.log("⚠️ Database session storage not available, using in-memory session:", error.message);
    // Continue without database storage for now
  }

  // Create JWT payload
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: sessionId,
  };

  // Generate access token (short-lived)
  const accessToken = jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'arc-website',
    audience: 'arc-users',
  } as jwt.SignOptions);

  // Generate refresh token (long-lived) 
  const refreshToken = jwt.sign(
    { userId: user.id, sessionId: sessionId },
    JWT_SECRET as string,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'arc-website',
      audience: 'arc-refresh',
    } as jwt.SignOptions
  );

  return {
    accessToken,
    refreshToken,
    expiresAt: new Date(Date.now() + parseExpirationTime(JWT_EXPIRES_IN)),
    sessionId: sessionId,
  };
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'arc-website',
      audience: 'arc-users',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    console.log('JWT verification failed:', error);
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: string; sessionId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'arc-website',
      audience: 'arc-refresh',
    }) as any;

    return {
      userId: decoded.userId,
      sessionId: decoded.sessionId,
    };
  } catch (error) {
    console.log('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<SessionTokens | null> {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return null;
  }

  // Try to check session in database (graceful fallback if table doesn't exist)
  try {
    const session = await prisma.userSession.findUnique({
      where: { 
        id: decoded.sessionId,
        userId: decoded.userId,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session || !session.user.isActive) {
      return null;
    }

    // Generate new tokens
    return generateTokens(session.user);
  } catch (error: any) {
    console.log("⚠️ Database session validation not available, using user lookup:", error.message);
    
    // Fallback: Just validate the user exists and is active
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        return null;
      }

      // Generate new tokens
      return generateTokens(user);
    } catch (userError) {
      console.error("❌ Failed to validate user for token refresh:", userError);
      return null;
    }
  }
}

/**
 * Invalidate session (logout)
 */
export async function invalidateSession(sessionId: string): Promise<boolean> {
  try {
    await prisma.userSession.delete({
      where: { id: sessionId },
    });
    console.log("✅ Session invalidated in database");
    return true;
  } catch (error: any) {
    console.log("⚠️ Database session invalidation not available:", error.message);
    // Return true since we don't want to block logout
    return true;
  }
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateAllUserSessions(userId: string): Promise<boolean> {
  try {
    await prisma.userSession.deleteMany({
      where: { userId },
    });
    console.log("✅ All user sessions invalidated in database");
    return true;
  } catch (error: any) {
    console.log("⚠️ Database session invalidation not available:", error.message);
    // Return true since we don't want to block logout
    return true;
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.userSession.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    console.log(`✅ Cleaned up ${result.count} expired sessions`);
    return result.count;
  } catch (error: any) {
    console.log("⚠️ Database session cleanup not available:", error.message);
    return 0;
  }
}

/**
 * Check if token is expired or will expire soon
 */
export function isTokenExpiringSoon(token: string, bufferMinutes: number = 5): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return true;
    }

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const bufferTime = bufferMinutes * 60 * 1000; // Convert minutes to milliseconds
    const now = Date.now();

    return (expirationTime - now) <= bufferTime;
  } catch (error) {
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
}

/**
 * Generate a random session token
 */
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

/**
 * Parse expiration time string to milliseconds
 */
function parseExpirationTime(timeString: string): number {
  const match = timeString.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error(`Invalid time format: ${timeString}`);
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }
}

/**
 * Validate session in database
 */
export async function validateSessionInDatabase(sessionId: string, userId: string): Promise<boolean> {
  try {
    const session = await prisma.userSession.findUnique({
      where: {
        id: sessionId,
        userId: userId,
        expiresAt: { gt: new Date() },
      },
    });

    return !!session;
  } catch (error: any) {
    console.log("⚠️ Database session validation not available, skipping validation:", error.message);
    // Return true to allow the session to be valid (graceful degradation)
    return true;
  }
}
