"use client";

import { useEffect } from "react";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AdminLayout as NewAdminLayout } from "@/components/admin/admin-layout";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading, isHydrated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated or not an admin/super_admin
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (isLoading) return;

    if (!user) {
      router.push("/login");
    }
  }, [user, router, isLoading]);

  // Show loading state only if auth is still loading or not hydrated yet
  if (isLoading || !isHydrated) {
    return (
      <div className="h-screen bg-background">
        {/* Minimal loading - just a progress bar */}
        <div className="w-full h-1 bg-muted">
          <div className="h-full bg-primary animate-pulse"></div>
        </div>
      </div>
    );
  }

  // If not loading but no user, redirect immediately (no loading screen)
  if (!user) {
    return null; // Return null to avoid flash, redirect will happen in useEffect
  }

  // Show access denied for non-admin users
  if (user.role !== "admin" && user.role !== "super_admin") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the admin panel.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Current role: <span className="font-medium">{user.role}</span>
            <br />
            Required roles: <span className="font-medium">admin</span> or{" "}
            <span className="font-medium">super_admin</span>
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <NewAdminLayout>{children}</NewAdminLayout>;
}
