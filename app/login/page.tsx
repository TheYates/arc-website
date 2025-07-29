"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const { login, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) return;

    setIsAuthReady(true);

    // If user is already logged in, redirect to appropriate page
    if (user) {
      redirectBasedOnRole(user.role);
    }
  }, [user, authLoading, router]);

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "admin":
      case "super_admin":
        router.push("/admin");
        break;
      case "reviewer":
        router.push("/reviewer");
        break;
      case "care_giver":
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!emailOrUsername || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(emailOrUsername, password);

      if (result.success) {
        // This should redirect automatically via the useEffect above
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto" />
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-teal-600 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold">Alpha Rescue Consult</span>
          </div>
          <p>Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <label
                  htmlFor="emailOrUsername"
                  className="block text-sm font-medium mb-2"
                >
                  Email or Username
                </label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm">
                Don't have an account?{" "}
                <Link
                  href="/get-started"
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Apply for care services
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Demo Credentials:</h3>
              <div className="text-xs space-y-1">
                <div>
                  <strong>Admin:</strong> admin / password
                </div>
                <div>
                  <strong>Reviewer:</strong> drmensah / password
                </div>
                <div>
                  <strong>Care Giver:</strong> nurseama / password
                </div>
                <div>
                  <strong>Patient:</strong> patient1 / password
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm hover:text-teal-600">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
