"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function PasswordResetDialog({ open, onOpenChange, user }: PasswordResetDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const [copied, setCopied] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const handleReset = async () => {
    if (!user || !currentUser) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: currentUser.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewPassword(data.newPassword);
        setStep("success");
        toast({
          title: "Password Reset",
          description: `Password has been reset for ${user.firstName} ${user.lastName}`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reset password",
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
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Password copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setNewPassword("");
    setCopied(false);
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-orange-600" />
                Reset Password
              </DialogTitle>
              <DialogDescription>
                Reset password for <strong>{user.firstName} {user.lastName}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This will generate a new password and force the user to change it on their next login.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>User Details</Label>
                <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 uppercase">{user.role}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReset}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Password Reset Successful
              </DialogTitle>
              <DialogDescription>
                New password generated for {user.firstName} {user.lastName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  The password has been reset successfully. The user will be required to change this password on their next login.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Temporary Password</Label>
                <div className="flex space-x-2">
                  <Input
                    id="new-password"
                    type="text"
                    value={newPassword}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  <strong>Important:</strong> Share this password securely with the user. They must change it on their next login.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}