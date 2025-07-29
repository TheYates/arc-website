"use client";

import { useState, useEffect } from "react";
import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  ClipboardList,
  CheckSquare,
  Settings,
  PieChart,
  Package,
  UserPlus,
  Bell,
  Calendar,
  Home,
  Menu,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  LogOut,
  User,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandSearch } from "@/components/ui/command-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { hasPermission } from "@/lib/auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  // Redirect to login if not authenticated or not an admin/super_admin
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      router.push("/login");
    }
  }, [user, router]);

  // Show loading while redirecting
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="space-y-4 w-full max-w-md mx-auto">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <Home className="h-5 w-5" />,
      permission: "admin",
    },
    {
      name: "Applications",
      href: "/admin/applications",
      icon: <ClipboardList className="h-5 w-5" />,
      permission: "admin",
    },
    {
      name: "Careers",
      href: "/admin/careers",
      icon: <Briefcase className="h-5 w-5" />,
      permission: "admin",
    },
    {
      name: "Patients",
      href: "/admin/patients",
      icon: <Users className="h-5 w-5" />,
      permission: "patient_management",
    },
    {
      name: "Packages",
      href: "/admin/packages",
      icon: <Package className="h-5 w-5" />,
      permission: "admin",
    },
    {
      name: "Scheduling",
      href: "/admin/scheduling",
      icon: <Calendar className="h-5 w-5" />,
      permission: "scheduling",
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: <PieChart className="h-5 w-5" />,
      permission: "reports",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <UserPlus className="h-5 w-5" />,
      permission: "user_management",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      permission: "admin",
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 hidden border-r bg-background transition-all duration-300 lg:flex lg:flex-col",
          sidebarCollapsed ? "lg:w-[4.5rem]" : "lg:w-64"
        )}
      >
        <div className="flex h-16 items-center border-b px-6 justify-between">
          <div
            className={cn(
              "flex items-center space-x-2",
              sidebarCollapsed && "justify-center w-full"
            )}
          >
            <div className="bg-primary p-1.5 rounded">
              <CheckSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-semibold">ARC Admin</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="flex flex-col py-2 flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) =>
              hasPermission(user.role, item.permission) ? (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      sidebarCollapsed && "justify-center px-2"
                    )}
                  >
                    {item.icon}
                    {!sidebarCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Button>
                </Link>
              ) : null
            )}
          </nav>
        </div>
        {/* User Profile Section (No Logout - moved to header) */}
        <div className="border-t p-4 mt-auto">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg bg-muted/50",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm flex-shrink-0">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-16 items-center border-b bg-background px-4">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded">
              <CheckSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold">ARC Admin</span>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Button size="icon" variant="ghost">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Mobile Command Search */}
            <div className="sm:hidden">
              <CommandSearch variant="admin" />
            </div>
          </div>
        </div>

        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center border-b px-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary p-1.5 rounded">
                <CheckSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">ARC Admin</span>
            </div>
          </div>
          <div className="flex flex-col py-2">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) =>
                hasPermission(user.role, item.permission) ? (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        pathname === item.href
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Button>
                  </Link>
                ) : null
              )}
            </nav>
          </div>
          <div className="border-t p-4 mt-auto">
            <div className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-muted-foreground">{user.email}</div>

            {/* Mobile Logout Button */}
            <Button
              variant="ghost"
              className="w-full justify-start mt-3 text-muted-foreground hover:text-red-600 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div
        className={cn(
          "flex flex-col flex-1",
          sidebarCollapsed ? "lg:pl-[4.5rem]" : "lg:pl-64"
        )}
      >
        <header className="h-16 border-b bg-background hidden lg:flex items-center px-6">
          {/* Left spacer */}
          <div className="flex-1"></div>

          {/* Centered Command Search */}
          <div className="flex-1 flex justify-center max-w-lg">
            <CommandSearch variant="admin" />
          </div>

          {/* Right side - Theme Toggle, Notifications and User Menu */}
          <div className="flex-1 flex items-center justify-end space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            <Button size="icon" variant="ghost">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/admin/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6 pt-20 lg:pt-6">
          <div className="w-full max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
