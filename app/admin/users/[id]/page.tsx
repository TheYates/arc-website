"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth, User, UserRole, hasPermission } from "@/lib/auth";
import { getUserAccount } from "@/lib/api/users";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Eye,
  UserCheck,
  Users,
  Crown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminUserDetailMobile } from "@/components/mobile/admin-user-detail";

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Authentication is handled by admin layout - no need for individual checks

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/users/${id}`);
        if (!response.ok) {
          throw new Error('User not found');
        }
        const data = await response.json();
        setUserDetails(data.user);
        setEditForm(data.user);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        setUserDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      super_admin: {
        label: "Super Admin",
        variant: "default" as const,
        icon: <Crown className="h-3 w-3 mr-1" />,
      },
      admin: {
        label: "Admin",
        variant: "secondary" as const,
        icon: <Shield className="h-3 w-3 mr-1" />,
      },
      reviewer: {
        label: "Reviewer",
        variant: "outline" as const,
        icon: <Eye className="h-3 w-3 mr-1" />,
      },
      caregiver: {
        label: "Care Giver",
        variant: "outline" as const,
        icon: <UserCheck className="h-3 w-3 mr-1" />,
      },
      patient: {
        label: "Patient",
        variant: "secondary" as const,
        icon: <Users className="h-3 w-3 mr-1" />,
      },
    };

    const config = roleConfig[role];
    return (
      <Badge variant={config.variant}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (user: User) => {
    if (!user.isEmailVerified) {
      return (
        <Badge variant="secondary" className="flex items-center">
          <XCircle className="h-3 w-3 mr-1" />
          Unverified
        </Badge>
      );
    }
    if (!user.profileComplete) {
      return (
        <Badge variant="outline" className="flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Incomplete
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSaveEdit = () => {
    if (!userDetails) return;

    // Update the user details (in a real app, this would call an API)
    const updatedUser = {
      ...userDetails,
      ...editForm,
    };

    setUserDetails(updatedUser);
    setIsEditing(false);

    // In a real app, you would update localStorage or call an API here
    // User updated successfully

    toast({
      title: "Success",
      description: "User updated successfully",
    });
  };

  const handleCancelEdit = () => {
    setEditForm({
      firstName: userDetails?.firstName,
      lastName: userDetails?.lastName,
      phone: userDetails?.phone,
      address: userDetails?.address,
    });
    setIsEditing(false);
  };

  if (!user || !hasPermission(user.role, "user_management")) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground">
            You don't have permission to view this page
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <UserIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2 animate-pulse" />
          <div className="text-muted-foreground">Loading user details...</div>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground mb-2">User not found</div>
          <Button variant="outline" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <AdminUserDetailMobile id={id} />
      </div>

      {/* Header */}
      <div className="hidden md:block space-y-4">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/users")}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>

        {/* User Info and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Details</h1>
            <p className="text-muted-foreground">
              View and manage user information
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">
                  {userDetails.firstName} {userDetails.lastName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="h-3 w-3" />
                  {userDetails.email}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  {getRoleBadge(userDetails.role)}
                  {getStatusBadge(userDetails)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={editForm.firstName || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, firstName: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-muted rounded-md">
                      {userDetails.firstName}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={editForm.lastName || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lastName: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-muted rounded-md">
                      {userDetails.lastName}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md text-muted-foreground">
                    @{userDetails.username}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md text-muted-foreground">
                    {userDetails.email}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editForm.phone || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-muted rounded-md flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {userDetails.phone}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={editForm.address || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-muted rounded-md flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {userDetails.address}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status & Activity */}
        <div className="hidden md:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Email Verification</span>
                {userDetails.isEmailVerified ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Profile Complete</span>
                {userDetails.profileComplete ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Incomplete
                  </Badge>
                )}
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <strong>Email Verification:</strong> Users receive a
                  verification email upon account creation. They must click the
                  verification link to activate their account.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(userDetails.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Last Login</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(userDetails.lastLogin || "")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
