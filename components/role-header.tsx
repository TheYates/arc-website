"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import {
  Heart,
  Users,
  Calendar,
  ClipboardList,
  Bell,
  User,
  Settings,
  LogOut,
  Home,
  FileText,
  ClipboardCheck,
  CheckSquare,
  Stethoscope,
  Package,
  PieChart,
  UserPlus,
  Briefcase,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

interface RoleHeaderProps {
  role: "admin" | "reviewer" | "caregiver";
}

export function RoleHeader({ role }: RoleHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const getRoleConfig = () => {
    switch (role) {
      case "admin":
        return {
          title: "ARC Admin",
          icon: <CheckSquare className="h-5 w-5 text-white" />,
          bgColor: "bg-blue-600",
          accentColor: "text-blue-600",
          accentBg: "bg-blue-50",
          searchVariant: "admin" as const,
        };
      case "reviewer":
        return {
          title: "Alpha Rescue",
          icon: <Heart className="h-5 w-5 text-white" />,
          bgColor: "bg-purple-600",
          accentColor: "text-purple-600",
          accentBg: "bg-purple-50",
          searchVariant: "reviewer" as const,
        };
      case "caregiver":
        return {
          title: "Alpha Rescue",
          icon: <Heart className="h-5 w-5 text-white" />,
          bgColor: "bg-teal-600",
          accentColor: "text-teal-600",
          accentBg: "bg-teal-50",
          searchVariant: "caregiver" as const,
        };
    }
  };

  const getNavigationItems = (): NavigationItem[] => {
    const baseUrl = `/${role}`;

    switch (role) {
      case "admin":
        return [
          {
            name: "Dashboard",
            href: baseUrl,
            icon: <Home className="h-4 w-4 mr-2" />,
            isActive: pathname === baseUrl,
          },
          {
            name: "Applications",
            href: `${baseUrl}/applications`,
            icon: <ClipboardList className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/applications`),
          },
          {
            name: "Careers",
            href: `${baseUrl}/careers`,
            icon: <Briefcase className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/careers`),
          },
          {
            name: "Patients",
            href: `${baseUrl}/patients`,
            icon: <Users className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/patients`),
          },
          {
            name: "Users",
            href: `${baseUrl}/users`,
            icon: <UserPlus className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/users`),
          },
        ];
      case "reviewer":
        return [
          {
            name: "Dashboard",
            href: baseUrl,
            icon: <Home className="h-4 w-4 mr-2" />,
            isActive: pathname === baseUrl,
          },
          {
            name: "My Patients",
            href: `${baseUrl}/patients`,
            icon: <Users className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/patients`),
          },
          {
            name: "Reviews",
            href: `${baseUrl}/reviews`,
            icon: <FileText className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/reviews`),
          },
          {
            name: "Schedule",
            href: `${baseUrl}/schedule`,
            icon: <Calendar className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/schedule`),
          },
          {
            name: "Reports",
            href: `${baseUrl}/reports`,
            icon: <ClipboardList className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/reports`),
          },
        ];
      case "caregiver":
        return [
          {
            name: "Dashboard",
            href: baseUrl,
            icon: <Home className="h-4 w-4 mr-2" />,
            isActive: pathname === baseUrl,
          },
          {
            name: "My Patients",
            href: `${baseUrl}/patients`,
            icon: <Users className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/patients`),
          },
          {
            name: "Vitals",
            href: `${baseUrl}/vitals`,
            icon: <Stethoscope className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/vitals`),
          },
          {
            name: "Schedule",
            href: `${baseUrl}/schedule`,
            icon: <Calendar className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/schedule`),
          },
          {
            name: "Tasks",
            href: `${baseUrl}/tasks`,
            icon: <ClipboardCheck className="h-4 w-4 mr-2" />,
            isActive: pathname.startsWith(`${baseUrl}/tasks`),
          },
        ];
    }
  };

  const config = getRoleConfig();
  const navigationItems = getNavigationItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`${config.bgColor} p-2 rounded-lg`}>
              {config.icon}
            </div>
            <span className="text-xl font-bold">{config.title}</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={
                  item.isActive
                    ? `${config.accentColor} ${config.accentBg}`
                    : "text-muted-foreground hover:text-foreground"
                }
                onClick={() => router.push(item.href)}
              >
                {item.icon}
                {item.name}
              </Button>
            ))}
          </nav>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 flex justify-center max-w-md mx-6">
          <div className="hidden md:block w-full">
            <CommandSearch variant={config.searchVariant} size="sm" />
          </div>
        </div>

        {/* Right side - Theme Toggle, Notifications and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button size="icon" variant="ghost" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
              1
            </span>
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
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/${role}/settings`)}
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
      </div>
    </header>
  );
}
