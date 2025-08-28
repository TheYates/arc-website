import { useMemo } from "react";
import { useAuth, User } from "@/lib/auth";

/**
 * Optimized auth hook that memoizes user data and provides
 * stable references to prevent unnecessary re-renders
 */
export function useOptimizedAuth() {
  const { user, isLoading, login, logout, refreshUser, isHydrated } = useAuth();

  // Memoize user data to prevent unnecessary re-renders
  const memoizedUser = useMemo(() => user, [user?.id, user?.role, user?.email]);

  // Memoize auth state
  const authState = useMemo(() => ({
    isAuthenticated: !!memoizedUser,
    isAdmin: memoizedUser?.role === "admin" || memoizedUser?.role === "super_admin",
    isReviewer: memoizedUser?.role === "reviewer",
    isCaregiver: memoizedUser?.role === "caregiver",
    isPatient: memoizedUser?.role === "patient",
    isSuperAdmin: memoizedUser?.role === "super_admin",
  }), [memoizedUser?.role]);

  // Memoize user profile data
  const userProfile = useMemo(() => {
    if (!memoizedUser) return null;
    
    return {
      id: memoizedUser.id,
      email: memoizedUser.email,
      firstName: memoizedUser.firstName,
      lastName: memoizedUser.lastName,
      fullName: `${memoizedUser.firstName} ${memoizedUser.lastName}`,
      initials: `${memoizedUser.firstName.charAt(0)}${memoizedUser.lastName.charAt(0)}`,
      role: memoizedUser.role,
      isEmailVerified: memoizedUser.isEmailVerified,
      isActive: memoizedUser.isActive,
      profileComplete: memoizedUser.profileComplete,
      mustChangePassword: memoizedUser.mustChangePassword,
    };
  }, [memoizedUser]);

  return {
    user: memoizedUser,
    userProfile,
    authState,
    isLoading,
    isHydrated,
    login,
    logout,
    refreshUser,
  };
}

/**
 * Hook for components that only need to know if user is authenticated
 * This prevents re-renders when user data changes but auth status doesn't
 */
export function useAuthStatus() {
  const { user, isLoading, isHydrated } = useAuth();

  return useMemo(() => ({
    isAuthenticated: !!user,
    isLoading,
    isHydrated,
  }), [!!user, isLoading, isHydrated]);
}

/**
 * Hook for components that only need user role information
 */
export function useUserRole() {
  const { user } = useAuth();
  
  return useMemo(() => ({
    role: user?.role || null,
    isAdmin: user?.role === "admin" || user?.role === "super_admin",
    isReviewer: user?.role === "reviewer",
    isCaregiver: user?.role === "caregiver",
    isPatient: user?.role === "patient",
    isSuperAdmin: user?.role === "super_admin",
  }), [user?.role]);
}

/**
 * Hook for components that only need basic user info
 */
export function useUserInfo() {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      initials: `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`,
      email: user.email,
    };
  }, [user?.id, user?.firstName, user?.lastName, user?.email]);
}
