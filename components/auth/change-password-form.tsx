"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { User, useAuth } from "@/lib/auth";

interface PasswordRequirements {
  minLength: number;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  requireUppercase: boolean;
  requireLowercase: boolean;
}

interface ChangePasswordFormProps {
  user: User;
  onPasswordChanged: () => void;
}

export default function ChangePasswordForm({ user, onPasswordChanged }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirements, setRequirements] = useState<PasswordRequirements | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  // Fetch password requirements on component mount
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await fetch('/api/auth/change-password');
        if (response.ok) {
          const data = await response.json();
          setRequirements(data.requirements);
        }
      } catch (error) {
        console.error('Failed to fetch password requirements:', error);
      }
    };

    fetchRequirements();
  }, []);

  // Real-time password validation
  useEffect(() => {
    if (!newPassword || !requirements) {
      setValidationErrors([]);
      return;
    }

    const errors: string[] = [];

    if (newPassword.length < requirements.minLength) {
      errors.push(`At least ${requirements.minLength} characters`);
    }
    if (requirements.requireNumbers && !/\d/.test(newPassword)) {
      errors.push('At least one number');
    }
    if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(newPassword)) {
      errors.push('At least one special character');
    }
    if (requirements.requireUppercase && !/[A-Z]/.test(newPassword)) {
      errors.push('At least one uppercase letter');
    }
    if (requirements.requireLowercase && !/[a-z]/.test(newPassword)) {
      errors.push('At least one lowercase letter');
    }

    setValidationErrors(errors);
  }, [newPassword, requirements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Password Requirements Not Met",
        description: "Please fix the password requirements below",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully",
        });

        // Refresh user data to update mustChangePassword flag
        await refreshUser();

        onPasswordChanged();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to change password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRequirementStatus = (requirement: string) => {
    return !validationErrors.includes(requirement);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>Password Change Required</CardTitle>
          <CardDescription>
            Hi {user.firstName}! For security reasons, you must change your password before continuing.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-600">Passwords don't match</p>
              )}
            </div>

            {/* Password Requirements */}
            {requirements && newPassword && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Password Requirements:</Label>
                <div className="space-y-1">
                  {[
                    `At least ${requirements.minLength} characters`,
                    'At least one number',
                    'At least one special character',
                    'At least one uppercase letter',
                    'At least one lowercase letter'
                  ].map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {getRequirementStatus(requirement) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${
                        getRequirementStatus(requirement) ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {requirement}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || validationErrors.length > 0 || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Choose a strong, unique password that you haven't used before. You'll use this password for all future logins.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}