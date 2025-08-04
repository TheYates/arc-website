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
import { useAuth, User, UserRole, hasPermission } from "@/lib/auth";
import { getUserAccount } from "@/lib/api/users";
import { formatDate } from "@/lib/utils";
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
} from "lucide-react";

interface UserAccount {
  user: User;
  password: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();
  const router = useRouter();

  // Authentication is handled by admin layout - no need for individual checks

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Get demo users (hardcoded in auth system) - EXCLUDING patients as they have their own page
        const demoUsers: User[] = [
          {
            id: "1",
            email: "admin@alpharescue.com",
            username: "admin",
            firstName: "Admin",
            lastName: "User",
            phone: "+233 XX XXX XXXX",
            address: "Accra, Ghana",
            role: "admin",
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: true,
          },
          {
            id: "2",
            email: "dr.mensah@alpharescue.com",
            username: "drmensah",
            firstName: "Dr. Kwame",
            lastName: "Mensah",
            phone: "+233 XX XXX XXXX",
            address: "Kumasi, Ghana",
            role: "reviewer",
            isEmailVerified: false, // Demo unverified user
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: false, // Demo incomplete profile
          },
          {
            id: "3",
            email: "ama.nurse@alpharescue.com",
            username: "nurseama",
            firstName: "Ama",
            lastName: "Asante",
            phone: "+233 XX XXX XXXX",
            address: "Tema, Ghana",
            role: "care_giver",
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: true,
          },
        ];

        // Get created users from localStorage - EXCLUDING patients
        const createdUsersData = localStorage.getItem("auth_users");
        let createdUsers: User[] = [];

        if (createdUsersData) {
          try {
            const userAccounts: UserAccount[] = JSON.parse(createdUsersData);
            createdUsers = userAccounts
              .map((account) => account.user)
              .filter((user) => user.role !== "patient"); // Exclude patients
          } catch (error) {
            console.error("Error loading created users:", error);
          }
        }

        // Combine all users (excluding patients - they have their own page)
        const allUsers = [...demoUsers, ...createdUsers];
        setUsers(allUsers);
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
        className: "bg-purple-100 text-purple-800",
        icon: <Crown className="h-3 w-3 mr-1" />,
      },
      admin: {
        label: "Admin",
        className: "bg-red-100 text-red-800",
        icon: <Shield className="h-3 w-3 mr-1" />,
      },
      reviewer: {
        label: "Reviewer",
        className: "bg-blue-100 text-blue-800",
        icon: <Eye className="h-3 w-3 mr-1" />,
      },
      care_giver: {
        label: "Care Giver",
        className: "bg-green-100 text-green-800",
        icon: <UserCheck className="h-3 w-3 mr-1" />,
      },
      patient: {
        label: "Patient",
        className: "bg-gray-100 text-gray-800",
        icon: <Users className="h-3 w-3 mr-1" />,
      },
    };

    const config = roleConfig[role];
    return (
      <Badge className={config.className}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (user: User) => {
    if (!user.isEmailVerified) {
      return <Badge variant="destructive">Unverified</Badge>;
    }
    if (!user.profileComplete) {
      return (
        <Badge className="bg-amber-100 text-amber-800">
          Incomplete Profile
        </Badge>
      );
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const filteredUsers = users.filter((user) => {
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
        !["reviewer", "care_giver"].includes(user.role)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      {/* User Statistics */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {
                role: "all",
                label: "Total Staff",
                icon: <Users className="h-4 w-4" />,
                count: users.length,
              },
              {
                role: "admin",
                label: "Admins",
                icon: <Shield className="h-4 w-4" />,
                count: users.filter((u) =>
                  ["super_admin", "admin"].includes(u.role)
                ).length,
              },
              {
                role: "care_giver",
                label: "Care Givers",
                icon: <UserCheck className="h-4 w-4" />,
                count: users.filter((u) => u.role === "care_giver").length,
              },
              {
                role: "reviewer",
                label: "Reviewers",
                icon: <Eye className="h-4 w-4" />,
                count: users.filter((u) => u.role === "reviewer").length,
              },
              {
                role: "unverified",
                label: "Unverified",
                icon: <Users className="h-4 w-4" />,
                count: users.filter((u) => !u.isEmailVerified).length,
              },
            ].map((item) => (
              <div
                key={item.role}
                className="flex flex-col items-center p-3 border rounded-lg bg-background"
              >
                <div className="p-1.5 rounded-full bg-primary/10 mb-2">
                  {item.icon}
                </div>
                <div className="text-lg font-bold">{item.count}</div>
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">All Staff</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="staff">Care Team</TabsTrigger>
          <TabsTrigger value="unverified">Unverified</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <CardTitle>Staff Accounts</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                📝 <strong>Verification:</strong> Users verify their email via
                verification link sent during account creation.
                <br />
                🏥 <strong>Patients:</strong> Managed separately on the{" "}
                <a
                  href="/admin/patients"
                  className="text-blue-600 hover:underline"
                >
                  Patients page
                </a>
                .
              </CardDescription>
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
                    <SelectItem value="care_giver">Care Giver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="text-muted-foreground">No users found</div>
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {user.email}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <span className="text-xs">
                                  @{user.username}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{formatUserDate(user.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{formatUserDate(user.lastLogin)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/users/${user.id}`)
                            }
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
