"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthHeader from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth, hasPermission, type User } from "@/lib/auth";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function UserManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Mock users data - in real app, this would come from API
  const mockUsers: User[] = [
    {
      id: "1",
      email: "superadmin@arc.com",
      username: "superadmin",
      firstName: "Super",
      lastName: "Admin",
      phone: "+233 24 000 0001",
      address: "ARC Headquarters, Accra",
      role: "super_admin",
      isEmailVerified: true,
      createdAt: "2024-01-01",
      lastLogin: "2024-01-15",
      profileComplete: true,
    },
    {
      id: "2",
      email: "admin@arc.com",
      username: "admin",
      firstName: "John",
      lastName: "Administrator",
      phone: "+233 24 000 0002",
      address: "East Legon, Accra",
      role: "admin",
      isEmailVerified: true,
      createdAt: "2024-01-02",
      lastLogin: "2024-01-14",
      profileComplete: true,
    },
    {
      id: "3",
      email: "dr.mensah@arc.com",
      username: "drmensah",
      firstName: "Dr. Kwame",
      lastName: "Mensah",
      phone: "+233 24 000 0003",
      address: "Airport Residential, Accra",
      role: "reviewer",
      isEmailVerified: true,
      createdAt: "2024-01-03",
      lastLogin: "2024-01-13",
      profileComplete: true,
    },
    {
      id: "4",
      email: "nurse.ama@arc.com",
      username: "nurseama",
      firstName: "Ama",
      lastName: "Osei",
      phone: "+233 24 000 0004",
      address: "Tema, Greater Accra",
      role: "care_giver",
      isEmailVerified: true,
      createdAt: "2024-01-04",
      lastLogin: "2024-01-12",
      profileComplete: true,
    },
    {
      id: "5",
      email: "patient@example.com",
      username: "patient1",
      firstName: "Akosua",
      lastName: "Asante",
      phone: "+233 24 000 0005",
      address: "Kumasi, Ashanti Region",
      role: "patient",
      isEmailVerified: true,
      createdAt: "2024-01-05",
      lastLogin: "2024-01-11",
      profileComplete: true,
    },
    {
      id: "6",
      email: "nurse.kwame@arc.com",
      username: "nursekwame",
      firstName: "Kwame",
      lastName: "Boateng",
      phone: "+233 24 000 0006",
      address: "Takoradi, Western Region",
      role: "care_giver",
      isEmailVerified: false,
      createdAt: "2024-01-06",
      lastLogin: "",
      profileComplete: false,
    },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && !hasPermission(user.role, "admin")) {
      router.push("/dashboard");
    }
    setUsers(mockUsers);
  }, [user, authLoading, router]);

  const filteredUsers = users.filter((u) => {
    // Hide super admin users from the interface (stealth mode)
    if (u.role === "super_admin") {
      return false;
    }

    const matchesSearch =
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "all" || u.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      super_admin: "Super Admin",
      admin: "Administrator",
      reviewer: "Medical Reviewer",
      care_giver: "Care Provider",
      patient: "Patient",
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      super_admin: "bg-purple-100 text-purple-800",
      admin: "bg-blue-100 text-blue-800",
      reviewer: "bg-orange-100 text-orange-800",
      care_giver: "bg-green-100 text-green-800",
      patient: "bg-slate-100 text-slate-800",
    };
    return colors[role as keyof typeof colors] || "bg-slate-100 text-slate-800";
  };

  const getStatusIcon = (user: User) => {
    if (!user.isEmailVerified) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (!user.profileComplete) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (user: User) => {
    if (!user.isEmailVerified) return "Email Not Verified";
    if (!user.profileComplete) return "Profile Incomplete";
    return "Active";
  };

  const canDeleteUser = (targetUser: User) => {
    if (!user) return false;
    if (targetUser.role === "super_admin") return false; // Super admin cannot be deleted
    if (targetUser.id === user.id) return false; // Cannot delete self
    return hasPermission(user.role, "admin");
  };

  const canEditUser = (targetUser: User) => {
    if (!user) return false;
    if (targetUser.role === "super_admin" && user.role !== "super_admin")
      return false;
    return hasPermission(user.role, "admin");
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

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-2">
            Manage system users and their permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {users.filter((u) => u.role !== "super_admin").length}
                  </p>
                  <p className="text-sm text-slate-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                  <p className="text-sm text-slate-600">Administrators</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {users.filter((u) => u.role === "care_giver").length}
                  </p>
                  <p className="text-sm text-slate-600">Care Providers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {users.filter((u) => u.role === "reviewer").length}
                  </p>
                  <p className="text-sm text-slate-600">Reviewers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-slate-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {users.filter((u) => u.role === "patient").length}
                  </p>
                  <p className="text-sm text-slate-600">Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>All Users</span>
              </CardTitle>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <p className="text-slate-600">
                      User creation form would go here. In the real application,
                      this would include fields for all user information and
                      role assignment.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="reviewer">Medical Reviewer</option>
                <option value="care_giver">Care Provider</option>
                <option value="patient">Patient</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-sm text-slate-600">{u.email}</div>
                        <div className="text-sm text-slate-500">
                          @{u.username}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(u.role)}>
                        {getRoleDisplayName(u.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(u)}
                        <span className="text-sm text-slate-600">
                          {getStatusText(u)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleDateString()
                          : "Never"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {canEditUser(u) && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDeleteUser(u) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {u.role === "super_admin" && (
                          <Badge variant="outline" className="text-xs">
                            Protected
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
