"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { authenticateUserClient } from "@/lib/api/client";
import {
  invalidateSession,
  isTokenExpiringSoon,
  getTokenExpiration,
  type JWTPayload,
} from "@/lib/jwt";
import { setAuthCookie, clearAuthCookie } from "@/lib/utils/auth-cookies";

export type UserRole =
  | "super_admin"
  | "admin"
  | "reviewer"
  | "caregiver"
  | "patient";

export interface User {
  id: string;
  email: string;
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

interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  isAuthenticated: boolean;
  sessionExpiresAt: Date | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const USERS_STORAGE_KEY = "auth_users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
  
  // Refs for intervals and timeouts
  const tokenRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Clear all intervals
  const clearIntervals = useCallback(() => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
      tokenRefreshInterval.current = null;
    }
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  }, []);

  // Validate stored session
  const validateStoredSession = useCallback(async (): Promise<AuthSession | null> => {
    try {
      const storedSession = localStorage.getItem("auth_session");
      if (!storedSession) {
        return null;
      }

      const parsedSession: AuthSession = JSON.parse(storedSession);
      
      // Check if session has expired
      if (new Date(parsedSession.expiresAt) <= new Date()) {
        console.log("🕒 Stored session has expired, removing...");
        localStorage.removeItem("auth_session");
        clearAuthCookie();
        return null;
      }

      // Server-side token validation for critical checks
      let isTokenValid = false;
      try {
        const validationResponse = await fetch("/api/auth/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: parsedSession.accessToken }),
        });

        if (validationResponse.ok) {
          const validationData = await validationResponse.json();
          isTokenValid = validationData.valid;

          // If token is expiring soon, we'll refresh it
          if (validationData.expiringSoon) {
            console.log("🔄 Token expiring soon, will refresh...");
          }
        }
      } catch (validationError) {
        console.log("⚠️ Server validation failed, falling back to client check:", validationError);

        // Fallback to basic client-side check if server validation fails
        try {
          const token = parsedSession.accessToken;
          if (token && typeof token === 'string') {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              const now = Math.floor(Date.now() / 1000);
              isTokenValid = !payload.exp || payload.exp > (now + 300);
            }
          }
        } catch {
          isTokenValid = false;
        }
      }

      if (!isTokenValid) {
        console.log("🔒 Token validation failed, attempting refresh...");
        
        // Try to refresh with refresh token using API endpoint
        try {
          const response = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: parsedSession.refreshToken }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.tokens) {
              const newSession: AuthSession = {
                user: parsedSession.user,
                accessToken: data.tokens.accessToken,
                refreshToken: data.tokens.refreshToken,
                sessionId: data.tokens.sessionId,
                expiresAt: new Date(data.tokens.expiresAt),
              };
              
              localStorage.setItem("auth_session", JSON.stringify(newSession));
              
              // Update cookie as well
              document.cookie = `auth_session=${encodeURIComponent(JSON.stringify(newSession))}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
              
              return newSession;
            }
          }
        } catch (refreshError) {
          console.log("❌ Failed to refresh token during validation:", refreshError);
        }
        
        console.log("❌ Failed to refresh token, session invalid");
        localStorage.removeItem("auth_session");
        clearAuthCookie();
        return null;
      }

      return parsedSession;
    } catch (error) {
      console.error("❌ Error validating stored session:", error);
      localStorage.removeItem("auth_session");
      document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      return null;
    }
  }, []);

  // Auto-logout function
  const autoLogout = useCallback(() => {
    console.log("⏰ Session expired, logging out automatically...");
    logout();
  }, []);

  // Setup session monitoring
  const setupSessionMonitoring = useCallback((sessionData: AuthSession) => {
    clearIntervals();
    
    // Optimized session monitoring - less frequent checks
    sessionCheckInterval.current = setInterval(() => {
      if (sessionData.accessToken && isTokenExpiringSoon(sessionData.accessToken, 5)) {
        console.log("⚠️ Token expiring soon, attempting refresh...");
        refreshSession();
      }

      // Check if session has expired
      if (new Date() >= new Date(sessionData.expiresAt)) {
        autoLogout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes instead of every minute

    // Set up auto-refresh 10 minutes before token expiration
    tokenRefreshInterval.current = setInterval(() => {
      if (sessionData.accessToken && isTokenExpiringSoon(sessionData.accessToken, 15)) {
        refreshSession();
      }
    }, 10 * 60 * 1000); // Check every 10 minutes instead of 5
  }, [autoLogout, clearIntervals]);

  // Optimized hydration-safe auth check
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized || typeof window === 'undefined') {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 Auth context initializing, checking stored session...");
    }
    setIsInitialized(true);

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(async () => {
      try {
        setIsHydrated(true);

        // Quick check for session existence before full validation
        const storedSession = localStorage.getItem("auth_session");
        if (!storedSession) {
          if (process.env.NODE_ENV === 'development') {
            console.log("🔍 No stored session found, skipping validation");
          }
          setIsLoading(false);
          return;
        }

        // First check for old localStorage format and migrate/clear
        const oldStoredUser = localStorage.getItem("auth_user");
        if (oldStoredUser) {
          console.log("🔄 Found old auth format, clearing...");
          localStorage.removeItem("auth_user");
        }

        // Validate stored session
        const validSession = await validateStoredSession();
        if (validSession) {
          console.log("✅ Valid session found, restoring user");
          setSession(validSession);
          setUser(validSession.user);
          setSessionExpiresAt(new Date(validSession.expiresAt));
          setupSessionMonitoring(validSession);
        } else {
          console.log("❌ No valid session found");
        }
      } catch (error) {
        console.error("❌ Error during auth initialization:", error);
        // Clear any potentially corrupted data
        localStorage.removeItem("auth_session");
        localStorage.removeItem("auth_user");
        clearAuthCookie();
      } finally {
        setIsLoading(false);
      }
    });
  }, [validateStoredSession, setupSessionMonitoring]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      clearIntervals();
    };
  }, [clearIntervals]);

  // Logout function
  const logout = useCallback(async () => {
    console.log("🚪 Logging out...");
    
    // Invalidate session in database if we have a session
    if (session?.sessionId) {
      try {
        await invalidateSession(session.sessionId);
      } catch (error) {
        console.error("❌ Failed to invalidate session:", error);
      }
    }

    // Clear all state and storage
    clearIntervals();
    setUser(null);
    setSession(null);
    setSessionExpiresAt(null);
    localStorage.removeItem("auth_session");
    localStorage.removeItem("auth_user"); // Remove old format too
    
    // Clear cookie as well
    document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Redirect to login page
    window.location.href = "/login";
  }, [session, clearIntervals]);

  // Refresh session function
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!session?.refreshToken) {
      console.log("❌ No refresh token available");
      return false;
    }

    try {
      console.log("🔄 Refreshing session...");
      
      // Call the refresh API endpoint instead of the server function directly
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });

      if (!response.ok) {
        console.log("❌ Failed to refresh session - API error");
        await logout();
        return false;
      }

      const data = await response.json();
      
      if (data.success && data.tokens) {
        const newSession: AuthSession = {
          user: session.user,
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          sessionId: data.tokens.sessionId,
          expiresAt: new Date(data.tokens.expiresAt),
        };

        setSession(newSession);
        setSessionExpiresAt(new Date(data.tokens.expiresAt));
        localStorage.setItem("auth_session", JSON.stringify(newSession));
        
        // Update cookie as well
        setAuthCookie(newSession);
        
        // Restart session monitoring with new session data
        setupSessionMonitoring(newSession);
        
        console.log("✅ Session refreshed successfully");
        return true;
      } else {
        console.log("❌ Failed to refresh session, logging out");
        await logout();
        return false;
      }
    } catch (error) {
      console.error("❌ Error refreshing session:", error);
      await logout();
      return false;
    }
  }, [session, logout, setupSessionMonitoring]);

  // Refresh user data function
  const refreshUser = useCallback(async () => {
    console.log("🔄 Refreshing user data...");
    if (!user || !session?.accessToken) return;

    try {
      const response = await fetch(`/api/auth/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        
        // Update session with new user data
        if (session) {
          const updatedSession = { ...session, user: updatedUser };
          setSession(updatedSession);
          localStorage.setItem("auth_session", JSON.stringify(updatedSession));
        }
        
        console.log("✅ User data refreshed:", {
          mustChangePassword: updatedUser.mustChangePassword,
        });
      } else if (response.status === 401) {
        console.log("🔒 User data refresh failed due to auth, attempting session refresh");
        await refreshSession();
      }
    } catch (error) {
      console.error("❌ Failed to refresh user data:", error);
    }
  }, [user, session, refreshSession]);

  // Login function
  const loginUser = useCallback(async (email: string, password: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("🔐 Auth context loginUser called:", { email });
    }
    setIsLoading(true);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("📡 Calling authenticateUserClient...");
      }
      const result = await authenticateUserClient(email, password);
      if (process.env.NODE_ENV === 'development') {
        console.log("📥 authenticateUserClient result:", result);
      }

      if (!result.success || !result.user || !result.tokens) {
        console.log("❌ Authentication failed:", result.error);
        setIsLoading(false);
        return {
          success: false,
          error: result.error || "Invalid email or password",
        };
      }

      console.log("✅ Authentication successful, setting up session");
      
      // Create session object
      const newSession: AuthSession = {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        sessionId: result.tokens.sessionId,
        expiresAt: result.tokens.expiresAt,
      };

      // Store session for persistence first
      localStorage.setItem("auth_session", JSON.stringify(newSession));
      setAuthCookie(newSession);
      console.log("💾 Session stored in localStorage and cookie");

      // Batch all state updates to minimize re-renders
      setUser(result.user);
      setSession(newSession);
      setSessionExpiresAt(result.tokens.expiresAt);
      setIsAuthenticated(true);
      setIsLoading(false);

      // Setup session monitoring after state updates
      setupSessionMonitoring(newSession);
      return { success: true };
    } catch (error) {
      console.log("💥 Login error in auth context:", error);
      setIsLoading(false);
      return { success: false, error: "Login failed" };
    }
  }, [setupSessionMonitoring]);

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        isLoading,
        isHydrated,
        isAuthenticated: !!user && !!session,
        sessionExpiresAt,
        login: loginUser,
        logout,
        refreshUser,
        refreshSession,
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
