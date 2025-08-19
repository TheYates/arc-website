import { NextRequest } from "next/server";
import { prisma } from "@/lib/database/postgresql";

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

/**
 * Simple authentication function for API routes
 * For now, this is a placeholder that returns a mock user
 * In a real implementation, this would validate JWT tokens or session cookies
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    // For development/testing purposes, we'll return a mock admin user
    // In production, this should validate actual authentication tokens
    
    // Check for authorization header (placeholder)
    const authHeader = request.headers.get("authorization");
    
    // For now, return a mock user based on the URL path or referer to simulate different roles
    const url = new URL(request.url);
    const pathname = url.pathname;
    const referer = request.headers.get("referer") || "";

    let mockRole = "ADMIN";

    // Check the current URL path first
    if (pathname.includes("/patient/")) {
      mockRole = "PATIENT";
    } else if (pathname.includes("/caregiver/")) {
      mockRole = "CAREGIVER";
    } else if (pathname.includes("/reviewer/")) {
      mockRole = "REVIEWER";
    }
    // If it's an API call, check the referer to determine the role
    else if (pathname.startsWith("/api/")) {
      if (referer.includes("/patient/")) {
        mockRole = "PATIENT";
      } else if (referer.includes("/caregiver/")) {
        mockRole = "CAREGIVER";
      } else if (referer.includes("/reviewer/")) {
        mockRole = "REVIEWER";
      } else if (referer.includes("/admin/")) {
        mockRole = "ADMIN";
      }
    }

    // Get a real user from the database
    const user = await prisma.user.findFirst({
      where: { role: mockRole as "PATIENT" | "ADMIN" | "CAREGIVER" | "REVIEWER" },
    });

    if (!user) {
      return {
        success: false,
        error: "No user found with the required role",
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
export async function canAccessPatient(user: any, patientId: string): Promise<boolean> {
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
