"use client";

import React, { createContext, useContext, useState } from "react";
import { authenticateUserClient } from "@/lib/api/client";

export type UserRole =
  | "super_admin"
  | "admin"
  | "reviewer"
  | "caregiver"
  | "patient";

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  profileComplete: boolean;
  mustChangePassword?: boolean;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    emailOrUsername: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const USERS_STORAGE_KEY = "auth_users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true to prevent hydration mismatch
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration-safe auth check
  React.useEffect(() => {
    console.log("🔍 Auth context initializing, checking localStorage...");

    // Use requestAnimationFrame for fastest possible execution
    requestAnimationFrame(() => {
      // Mark as hydrated first
      setIsHydrated(true);

      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("👤 Found stored user:", {
            email: parsedUser.email,
            role: parsedUser.role,
          });

          // Check if user has old uppercase role format - if so, clear and force re-login
          if (
            parsedUser.role &&
            parsedUser.role === parsedUser.role.toUpperCase()
          ) {
            console.log(
              "🔄 Detected old uppercase role format, clearing stored user"
            );
            localStorage.removeItem("auth_user");
            setUser(null);
          } else {
            setUser(parsedUser);
          }
        } catch (error) {
          console.log("❌ Error parsing stored user, removing:", error);
          localStorage.removeItem("auth_user");
        }
      } else {
        console.log("❌ No stored user found");
      }

      console.log("✅ Auth context initialization complete, setting isLoading to false");
      setIsLoading(false);
    });
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    // Redirect to login page
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    console.log("🔄 Refreshing user data...");
    if (!user) return;

    try {
      // Re-fetch user data to get updated mustChangePassword flag
      const response = await fetch(`/api/auth/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        console.log("✅ User data refreshed:", { mustChangePassword: updatedUser.mustChangePassword });
      }
    } catch (error) {
      console.error("❌ Failed to refresh user data:", error);
    }
  };

  const loginUser = async (emailOrUsername: string, password: string) => {
    console.log("🔐 Auth context loginUser called:", { emailOrUsername });
    setIsLoading(true);

    try {
      console.log("📡 Calling authenticateUserClient...");
      // Use client-side API to authenticate
      const result = await authenticateUserClient(emailOrUsername, password);
      console.log("📥 authenticateUserClient result:", result);

      if (!result.success || !result.user) {
        console.log("❌ Authentication failed:", result.error);
        setIsLoading(false);
        return {
          success: false,
          error: result.error || "Invalid email/username or password",
        };
      }

      console.log("✅ Authentication successful, setting user:", result.user);
      setUser(result.user);

      // Always store in localStorage for session persistence
      localStorage.setItem("auth_user", JSON.stringify(result.user));
      console.log("💾 User stored in localStorage");

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.log("💥 Login error in auth context:", error);
      setIsLoading(false);
      return { success: false, error: "Login failed" };
    }
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        login: loginUser,
        logout,
        refreshUser,
        isLoading,
        isHydrated,
      },
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Permission system for role-based access control
export function hasPermission(
  userRole: UserRole,
  requiredPermission: string
): boolean {
  const rolePermissions: Record<UserRole, string[]> = {
    super_admin: [
      "admin",
      "user_management",
      "system_settings",
      "audit_logs",
      "billing",
      "reports",
      "communication",
      "education",
      "scheduling",
      "patient_management",
      "caregiver_management",
      "medical_review",
    ],
    admin: [
      "admin",
      "user_management",
      "billing",
      "reports",
      "communication",
      "education",
      "scheduling",
      "patient_management",
      "caregiver_management",
    ],
    reviewer: ["medical_review", "patient_management", "reports"],
    caregiver: ["patient_management", "activity_logging", "care_plans"],
    patient: ["view_care_plan", "view_activities"],
  };

  const userPermissions = rolePermissions[userRole] || [];
  return userPermissions.includes(requiredPermission);
}
