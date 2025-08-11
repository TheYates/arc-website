"use client";

import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, User, UserRole, hasPermission } from "@/lib/auth";
import { getUserAccount } from "@/lib/api/users";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  Eye,
  Edit,
  Mail,
  Phone,
  Calendar,
  Crown,
  Plus,
  Trash2,
  MoreHorizontal,
  KeyRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminUsersMobile } from "@/components/mobile/admin-users";
import { PasswordResetDialog } from "@/components/admin/password-reset-dialog";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    address: "",
    role: "caregiver" as UserRole,
  });
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Persist view preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("admin_users_view");
    if (stored === "grid" || stored === "table") {
      setView(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("admin_users_view", view);
  }, [view]);

  // Authentication is handled by admin layout - no need for individual checks

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
      return <Badge variant="secondary">Unverified</Badge>;
    }
    if (!user.profileComplete) {
      return <Badge variant="outline">Incomplete</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const filteredUsers = users.filter((user) => {
    // Filter out inactive users (soft deleted)
    if (!user.isActive) {
      return false;
    }

    // Filter by role
    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false;
    }

    // Filter by tab
    if (activeTab !== "all") {
      if (
        activeTab === "admins" &&
        !["super_admin", "admin"].includes(user.role)
      )
        return false;
      if (
        activeTab === "staff" &&
        !["reviewer", "caregiver"].includes(user.role)
      )
        return false;
      if (activeTab === "unverified" && user.isEmailVerified) return false;
    }

    // Search term filtering
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(searchTermLower) ||
        user.lastName.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        user.username.toLowerCase().includes(searchTermLower)
      );
    }

    return true;
  });

  const formatUserDate = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return formatDate(date);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      phone: "",
      address: "",
      role: "caregiver",
    });
    setEditingUser(null);
    setShowAddDialog(false);
  };

  const handleAddUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username) {
      return; // Basic validation
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const data = await response.json();
      
      // Update local state
      setUsers(prevUsers => [...prevUsers, data.user]);
      resetForm();

      toast({
        title: "User Created",
        description: `${data.user.firstName} ${data.user.lastName} has been created successfully.`,
      });
    } catch (error) {
      console.error("Failed to add user:", error);
      toast({
        title: "Error Creating User",
        description: error instanceof Error ? error.message : "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser || !formData.firstName || !formData.lastName || !formData.email || !formData.username) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const data = await response.json();
      
      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user => user.id === editingUser.id ? data.user : user)
      );
      resetForm();

      toast({
        title: "User Updated",
        description: `${data.user.firstName} ${data.user.lastName} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Failed to edit user:", error);
      toast({
        title: "Error Updating User",
        description: error instanceof Error ? error.message : "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete user');
      }

      // Update local state (remove the user from the list)
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));

      toast({
        title: "User Deleted",
        description: `${userToDelete.firstName} ${userToDelete.lastName} has been deleted successfully.`,
      });

      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Error Deleting User",
        description: error instanceof Error ? error.message : "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user || !hasPermission(user.role, "user_management")) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground">
            You don't have permission to view this page
          </div>
        </div>
      </div>
    );
  }

  const loader = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error("Failed to load users for mobile:", error);
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <AdminUsersMobile
          loader={loader}
          title="User Management"
          subtitle="Manage platform users and their roles"
        />
      </div>

      <div className="hidden md:flex items-center justify-between">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage platform users and their roles
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card className="hidden md:block">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Search and filter platform users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={view === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("grid")}
              >
                Grid
              </Button>
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("table")}
              >
                Table
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="text-sm text-muted-foreground">
                📝 Verification emails are sent during account creation.
                Patients are managed separately on the{" "}
                <a
                  href="/admin/patients"
                  className="text-blue-600 hover:underline"
                >
                  Patients page
                </a>
                .
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9 w-full sm:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="caregiver">Caregiver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((u) => (
                <Card
                  key={u.id}
                  role="link"
                  tabIndex={0}
                  className="group cursor-pointer hover:border-primary/40"
                  onClick={() => {
                    if (!u.id) return;
                    router.push(`/admin/users/${u.id}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!u.id) return;
                      router.push(`/admin/users/${u.id}`);
                    }
                  }}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @{u.username}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {getRoleBadge(u.role)}
                        {getStatusBadge(u)}
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center truncate">
                        <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]">Created {formatUserDate(u.createdAt || "")}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[10px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!u.id) return;
                            router.push(`/admin/users/${u.id}`);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow
                      key={u.id}
                      role="link"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => {
                        if (!u.id) return;
                        router.push(`/admin/users/${u.id}`);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (!u.id) return;
                          router.push(`/admin/users/${u.id}`);
                        }
                      }}
                    >
                      <TableCell className="max-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              @{u.username}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center truncate">
                              <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(u.role)}</TableCell>
                      <TableCell>{getStatusBadge(u)}</TableCell>
                      <TableCell className="text-sm">
                        {formatUserDate(u.createdAt || "")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatUserDate(u.lastLogin || "")}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                if (!u.id) return;
                                router.push(`/admin/users/${u.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingUser(u);
                                setFormData({
                                  firstName: u.firstName,
                                  lastName: u.lastName,
                                  email: u.email,
                                  username: u.username,
                                  phone: u.phone || "",
                                  address: u.address || "",
                                  role: u.role,
                                });
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setUserToResetPassword(u)}
                              className="text-orange-600"
                            >
                              <KeyRound className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setUserToDelete(u)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={showAddDialog || !!editingUser} onOpenChange={(open) => {
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update the user's information below."
                : "Fill in the details to create a new user account."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Enter first name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Enter username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                  <SelectItem value="caregiver">Care Giver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter address"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={editingUser ? handleEditUser : handleAddUser}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => {
        if (!open) setUserToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {userToDelete?.firstName} {userToDelete?.lastName}
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Dialog */}
      <PasswordResetDialog
        open={!!userToResetPassword}
        onOpenChange={(open) => {
          if (!open) setUserToResetPassword(null);
        }}
        user={userToResetPassword}
      />
    </div>
  );
}
