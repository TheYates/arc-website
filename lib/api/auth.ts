import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/postgresql";

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

/**
 * Authentication function for API routes
 * Validates user session from cookies/headers
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  try {
    // Try to get user ID from various sources
    let userId: string | null = null;

    // 1. Check for Authorization header (JWT token)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // TODO: Implement JWT token validation
      // const token = authHeader.substring(7);
      // userId = validateJWT(token);
    }

    // 2. Check for session cookie
    const cookies = request.headers.get("cookie");
    if (cookies) {
      const sessionMatch = cookies.match(/auth_user_id=([^;]+)/);
      if (sessionMatch) {
        userId = decodeURIComponent(sessionMatch[1]);
      }
    }

    // 3. Check for custom header (for client-side requests)
    const userIdHeader = request.headers.get("x-user-id");
    if (userIdHeader) {
      userId = userIdHeader;
    }

    // 4. For development: Check referer and try to extract user info from localStorage
    // This is a fallback for when cookies aren't working properly
    if (!userId) {
      const referer = request.headers.get("referer") || "";
      const userAgent = request.headers.get("user-agent") || "";

      // Try to get user from session storage via a special header
      const sessionUser = request.headers.get("x-session-user");
      if (sessionUser) {
        try {
          const userData = JSON.parse(decodeURIComponent(sessionUser));
          userId = userData.id;
        } catch (e) {
          console.log("Failed to parse session user header");
        }
      }
    }

    if (!userId) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: "User account is deactivated",
      };
    }

    // Convert the user data to match the expected format
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.toLowerCase(),
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      profileComplete: user.profileComplete,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: "Authentication failed",
    };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: any, requiredRoles: string[]): boolean {
  if (!user || !user.role) {
    return false;
  }

  return requiredRoles.includes(user.role);
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: any): boolean {
  return hasRole(user, ["admin", "super_admin"]);
}

/**
 * Check if user can access patient data
 */
export async function canAccessPatient(
  user: any,
  patientId: string
): Promise<boolean> {
  if (!user) return false;

  // Admins can access all patients
  if (isAdmin(user)) return true;

  // Patients can only access their own data
  if (user.role === "patient") {
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });
    return patient?.id === patientId;
  }

  // Caregivers can access their assigned patients
  if (user.role === "caregiver") {
    const assignment = await prisma.caregiverAssignment.findFirst({
      where: {
        caregiverId: user.id,
        patientId,
        isActive: true,
      },
    });
    return !!assignment;
  }

  // Reviewers can access their assigned patients
  if (user.role === "reviewer") {
    const assignment = await prisma.reviewerAssignment.findFirst({
      where: {
        reviewerId: user.id,
        patientId,
        isActive: true,
      },
    });
    return !!assignment;
  }

  return false;
}
