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
import { AdminUsersMobile } from "@/components/mobile/admin-users";

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
  const [view, setView] = useState<"grid" | "table">("grid");
  const { user } = useAuth();
  const router = useRouter();

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
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: true,
            isActive: true,
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
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: false, // Demo incomplete profile
            isActive: true,
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
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: true,
            isActive: true,
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

  const loader = async () => {
    // Reuse the code path used to build demo + created users
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
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        profileComplete: true,
        isActive: true,
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
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        profileComplete: false,
        isActive: true,
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
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        profileComplete: true,
        isActive: true,
      },
    ];
    const createdUsersData = localStorage.getItem("auth_users");
    let createdUsers: User[] = [];
    if (createdUsersData) {
      try {
        const userAccounts: { user: User }[] = JSON.parse(createdUsersData);
        createdUsers = userAccounts
          .map((account) => account.user)
          .filter((u) => u.role !== "patient");
      } catch {}
    }
    return [...demoUsers, ...createdUsers];
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
                    <SelectItem value="care_giver">Care Giver</SelectItem>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(u.role)}
                        {getStatusBadge(u)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!u.id) return;
                          router.push(`/admin/users/${u.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        Created: {formatUserDate(u.createdAt || "")}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span className="whitespace-nowrap">
                          Last Login: {formatUserDate(u.lastLogin || "")}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <Mail className="mr-1 h-3 w-3" /> {u.email}
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
                      <TableCell>
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
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(u.role)}</TableCell>
                      <TableCell>{getStatusBadge(u)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{formatUserDate(u.createdAt || "")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="whitespace-nowrap">
                            {formatUserDate(u.lastLogin || "")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!u.id) return;
                            router.push(`/admin/users/${u.id}`);
                          }}
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
    </div>
  );
}
