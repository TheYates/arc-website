"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Log the user out
    logout();

    // Redirect to login page after a short delay
    const timer = setTimeout(() => {
      router.push("/login");
    }, 1000);

    return () => clearTimeout(timer);
  }, [logout, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      <p className="mt-4 text-slate-600">Logging out...</p>
    </div>
  );
}
