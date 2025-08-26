import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { verifyToken, validateSessionInDatabase, type JWTPayload } from "@/lib/jwt";

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

/**
 * Authentication function for API routes
 * Validates user session using JWT tokens and fallback methods
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  try {
    let tokenPayload: JWTPayload | null = null;
    let userId: string | null = null;

    // 1. Check for Authorization header (JWT token) - Primary method
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      console.log("🔍 Validating JWT token from Authorization header");
      
      tokenPayload = verifyToken(token);
      if (tokenPayload) {
        // Validate session in database
        const isValidSession = await validateSessionInDatabase(tokenPayload.sessionId, tokenPayload.userId);
        if (isValidSession) {
          userId = tokenPayload.userId;
          console.log("✅ JWT token validation successful");
        } else {
          console.log("❌ Session not found or expired in database");
          return {
            success: false,
            error: "Session expired or invalid",
          };
        }
      } else {
        console.log("❌ JWT token validation failed");
        return {
          success: false,
          error: "Invalid or expired token",
        };
      }
    }

    // 2. Fallback: Check for custom header (for client-side requests)
    if (!userId) {
      const userIdHeader = request.headers.get("x-user-id");
      if (userIdHeader) {
        console.log("🔍 Using x-user-id header fallback");
        userId = userIdHeader;
      }
    }

    // 3. Fallback: Check for session user header (development/migration support)
    if (!userId) {
      const sessionUser = request.headers.get("x-session-user");
      if (sessionUser) {
        try {
          console.log("🔍 Using x-session-user header fallback");
          const userData = JSON.parse(decodeURIComponent(sessionUser));
          userId = userData.id;
        } catch (e) {
          console.log("Failed to parse session user header");
        }
      }
    }

    // 4. Legacy fallback: Check for session cookie (to be phased out)
    if (!userId) {
      const cookies = request.headers.get("cookie");
      if (cookies) {
        const sessionMatch = cookies.match(/auth_user_id=([^;]+)/);
        if (sessionMatch) {
          console.log("🔍 Using legacy session cookie fallback");
          userId = decodeURIComponent(sessionMatch[1]);
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
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.toLowerCase(),
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      profileComplete: user.profileComplete,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Include token info in result if we validated via JWT
    const result: AuthResult = {
      success: true,
      user: userData,
    };

    if (tokenPayload) {
      (result as any).tokenPayload = tokenPayload;
    }

    return result;
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
