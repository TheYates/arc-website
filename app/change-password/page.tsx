"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import ChangePasswordForm from "@/components/auth/change-password-form";
import { Loader2 } from "lucide-react";

export default function ChangePasswordPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    setIsAuthReady(true);

    // If no user is logged in, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // If user doesn't need to change password, redirect to their dashboard
    if (!user.mustChangePassword) {
      redirectBasedOnRole(user.role);
      return;
    }
  }, [user, isLoading, router]);

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "admin":
      case "super_admin":
        router.push("/admin");
        break;
      case "reviewer":
        router.push("/reviewer");
        break;
      case "caregiver":
        router.push("/caregiver");
        break;
      case "patient":
        router.push("/patient");
        break;
      default:
        router.push("/");
        break;
    }
  };

  const handlePasswordChanged = () => {
    // After password is changed, redirect to appropriate dashboard
    if (user) {
      redirectBasedOnRole(user.role);
    }
  };

  // Show loading while auth is being determined
  if (!isAuthReady || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading if no user (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show loading if user doesn't need to change password (will redirect)
  if (!user.mustChangePassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ChangePasswordForm 
      user={user} 
      onPasswordChanged={handlePasswordChanged}
    />
  );
}
