import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeTokenUnsafe } from '@/lib/jwt-edge'

// SECURITY NOTE: This middleware provides basic auth routing using JWT decoding.
// Full cryptographic verification happens in API routes where Node.js crypto is available.
// This approach provides UX benefits while maintaining security at the API level.

// Define paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/admin',
  '/caregiver',
  '/patient',
  '/reviewer',
  '/profile',
  '/api/admin',
  '/api/caregiver-schedules',
  '/api/service-requests',
  '/api/patients',
  '/api/medications',
  '/api/care-notes',
  '/api/medical-reviews',
  '/api/notifications',
]

// Define paths that should redirect authenticated users (login/register pages)
const authPaths = [
  '/login',
]

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/about',
  '/contact',
  '/services',
  '/careers',
  '/get-started',
  '/more',
  '/verify-email',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/health',
  '/api/careers',
  '/api/patient/application',
]

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(path => pathname.startsWith(path))
}

function isAuthPath(pathname: string): boolean {
  return authPaths.some(path => pathname.startsWith(path))
}

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => 
    pathname === path || 
    (path.endsWith('/') && pathname.startsWith(path)) ||
    pathname.startsWith('/services/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp')
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_next/') ||
    pathname.includes('.') && !pathname.includes('/api/')
  ) {
    return NextResponse.next()
  }

  // Check for auth token in various places
  let token: string | null = null
  
  // 1. Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  
  // 2. Check auth_session cookie (for browser requests)
  if (!token) {
    const authSession = request.cookies.get('auth_session')
    if (authSession) {
      try {
        const sessionData = JSON.parse(authSession.value)
        token = sessionData.accessToken
      } catch (e) {
        // Invalid session cookie, clear it
        const response = NextResponse.next()
        response.cookies.delete('auth_session')
        console.log('🗑️ Clearing invalid auth_session cookie')
      }
    }
  }

  // Decode token if present (basic validation for middleware)
  // Full cryptographic verification happens in API routes
  let isAuthenticated = false
  let userRole: string | null = null
  
  if (token) {
    const payload = decodeTokenUnsafe(token)
    if (payload) {
      isAuthenticated = true
      userRole = payload.role.toLowerCase() // Convert to lowercase for consistent role checking
      // Only log on first access or role changes for cleaner logs
      // console.log(`✅ Middleware: Valid token format for user ${payload.email} (${payload.role} -> ${userRole})`)
    } else {
      console.log('❌ Middleware: Invalid or expired token format')
    }
  }

  // Handle protected paths
  if (isProtectedPath(pathname)) {
    if (!isAuthenticated) {
      console.log(`🔒 Middleware: Redirecting unauthenticated user from ${pathname} to /login`)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based access control for admin paths
    if (pathname.startsWith('/admin') && !['admin', 'super_admin'].includes(userRole!)) {
      console.log(`🚫 Middleware: Unauthorized access attempt to ${pathname} by role ${userRole}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Role-based access control for caregiver paths
    if (pathname.startsWith('/caregiver') && userRole !== 'caregiver') {
      console.log(`🚫 Middleware: Unauthorized access attempt to ${pathname} by role ${userRole}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Role-based access control for patient paths
    if (pathname.startsWith('/patient') && userRole !== 'patient') {
      console.log(`🚫 Middleware: Unauthorized access attempt to ${pathname} by role ${userRole}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Role-based access control for reviewer paths
    if (pathname.startsWith('/reviewer') && userRole !== 'reviewer') {
      console.log(`🚫 Middleware: Unauthorized access attempt to ${pathname} by role ${userRole}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Handle auth paths (redirect authenticated users away from login)
  if (isAuthPath(pathname) && isAuthenticated) {
    console.log(`🔄 Middleware: Redirecting authenticated user from ${pathname} to /dashboard`)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow the request to continue
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
