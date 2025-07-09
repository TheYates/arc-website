"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthHeader from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth, hasPermission, type UserRole } from "@/lib/auth";
import { AuditLogger } from "@/lib/audit-log";
import { EmailVerificationService } from "@/lib/email-verification";
import { NotificationService } from "@/lib/notifications";
import {
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

interface CreateUserForm {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  role: UserRole;
  password: string;
  confirmPassword: string;
  sendWelcomeEmail: boolean;
  requirePasswordChange: boolean;
}

export default function CreateUserPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<CreateUserForm>({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    role: "patient",
    password: "",
    confirmPassword: "",
    sendWelcomeEmail: true,
    requirePasswordChange: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && !hasPermission(user.role, "admin")) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validateForm = (): string | null => {
    if (
      !formData.email ||
      !formData.username ||
      !formData.firstName ||
      !formData.lastName
    ) {
      return "Please fill in all required fields";
    }

    if (!formData.email.includes("@")) {
      return "Please enter a valid email address";
    }

    if (formData.username.length < 3) {
      return "Username must be at least 3 characters long";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    if (!formData.phone.match(/^\+?[\d\s\-$$$$]+$/)) {
      return "Please enter a valid phone number";
    }

    return null;
  };

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      password,
      confirmPassword: password,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to create user
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real app, this would call the backend API
      const newUser = {
        id: Date.now().toString(),
        email: formData.email,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        lastLogin: "",
        profileComplete: true,
      };

      // Log the user creation
      if (user) {
        await AuditLogger.log(
          user.id,
          user.email,
          "admin.user.create",
          "user",
          {
            newUserId: newUser.id,
            newUserEmail: newUser.email,
            newUserRole: newUser.role,
            createdBy: user.email,
          }
        );
      }

      // Send verification email if requested
      if (formData.sendWelcomeEmail) {
        await EmailVerificationService.sendVerificationEmail(formData.email);
      }

      // Create welcome notification for the new user
      await NotificationService.createNotification({
        userId: newUser.id,
        title: "Welcome to Alpha Rescue Consult",
        message: `Your account has been created successfully. ${
          formData.sendWelcomeEmail
            ? "Please check your email to verify your account."
            : ""
        }`,
        type: "success",
        read: false,
      });

      // Create notification for admin
      if (user) {
        await NotificationService.createNotification({
          userId: user.id,
          title: "New User Created",
          message: `Successfully created account for ${formData.firstName} ${formData.lastName} (${formData.role})`,
          type: "success",
          read: false,
        });
      }

      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        router.push("/admin/users");
      }, 3000);
    } catch (err) {
      setError("Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDescription = (role: UserRole) => {
    const descriptions = {
      super_admin: "Full system access with all administrative privileges",
      admin: "Administrative access to user management and system settings",
      reviewer: "Medical review access for patient activities and care plans",
      care_giver:
        "Care provider access to assigned patients and activity logging",
      patient: "Patient access to personal care plan and health information",
    };
    return descriptions[role];
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      super_admin: "bg-purple-100 text-purple-800",
      admin: "bg-blue-100 text-blue-800",
      reviewer: "bg-orange-100 text-orange-800",
      care_giver: "bg-green-100 text-green-800",
      patient: "bg-slate-100 text-slate-800",
    };
    return colors[role];
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasPermission(user.role, "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthHeader />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                User Created Successfully!
              </h2>
              <p className="text-slate-600 mb-6">
                The new user account for {formData.firstName}{" "}
                {formData.lastName} has been created successfully.
                {formData.sendWelcomeEmail &&
                  " A verification email has been sent to their email address."}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/admin/users")}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Back to User Management
                </Button>
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setFormData({
                      email: "",
                      username: "",
                      firstName: "",
                      lastName: "",
                      phone: "",
                      address: "",
                      role: "patient",
                      password: "",
                      confirmPassword: "",
                      sendWelcomeEmail: true,
                      requirePasswordChange: true,
                    });
                  }}
                  variant="outline"
                  className="ml-2 bg-transparent"
                >
                  Create Another User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create New User</h1>
          <p className="text-slate-600 mt-2">
            Add a new user to the Alpha Rescue Consult system
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-slate-700 mb-2"
                      >
                        First Name *
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-slate-700 mb-2"
                      >
                        Last Name *
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700 mb-2"
                      >
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-slate-700 mb-2"
                      >
                        Username *
                      </label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter username"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Address
                    </label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      User Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      disabled={isLoading}
                    >
                      <option value="patient">Patient</option>
                      <option value="care_giver">Care Provider</option>
                      <option value="reviewer">Medical Reviewer</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <p className="text-sm text-slate-500 mt-1">
                      {getRoleDescription(formData.role)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-slate-700"
                        >
                          Password *
                        </label>
                        <Button
                          type="button"
                          onClick={generateRandomPassword}
                          size="sm"
                          variant="outline"
                          className="text-xs bg-transparent"
                          disabled={isLoading}
                        >
                          Generate Random
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter password"
                          required
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

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-slate-700 mb-2"
                      >
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm password"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="sendWelcomeEmail"
                        name="sendWelcomeEmail"
                        checked={formData.sendWelcomeEmail}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="sendWelcomeEmail"
                        className="text-sm text-slate-700"
                      >
                        Send welcome email with verification link
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requirePasswordChange"
                        name="requirePasswordChange"
                        checked={formData.requirePasswordChange}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="requirePasswordChange"
                        className="text-sm text-slate-700"
                      >
                        Require password change on first login
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Role Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Badge className={getRoleColor(formData.role)}>
                        {formData.role.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {getRoleDescription(formData.role)}
                    </p>

                    <div className="pt-4 border-t border-slate-200">
                      <h4 className="font-medium text-slate-900 mb-2">
                        Account Summary
                      </h4>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p>
                          <strong>Name:</strong> {formData.firstName}{" "}
                          {formData.lastName}
                        </p>
                        <p>
                          <strong>Email:</strong> {formData.email}
                        </p>
                        <p>
                          <strong>Username:</strong> {formData.username}
                        </p>
                        <p>
                          <strong>Role:</strong>{" "}
                          {formData.role.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <Button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating User...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create User
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/admin/users")}
                        className="w-full bg-transparent"
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
