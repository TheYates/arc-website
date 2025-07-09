"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import NotificationBell from "@/components/notification-bell";
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Home,
  Users,
  FileText,
  Activity,
  ShoppingCart,
  Stethoscope,
  ClipboardList,
  Calendar,
  DollarSign,
  Phone,
  Shield,
  GraduationCap,
  Package,
  Building2,
  BarChart3,
  Cog,
  BookOpen,
  Pill,
} from "lucide-react";

export default function AuthHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".profile-menu-container")) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const getNavigationCategories = () => {
    if (!user) return { items: [], categories: [] };

    const baseItems = [{ name: "Dashboard", href: "/dashboard", icon: Home }];

    switch (user.role) {
      case "super_admin":
      case "admin":
        return {
          items: baseItems,
          categories: [
            {
              name: "People",
              icon: Building2,
              items: [{ name: "Users", href: "/admin/users", icon: Users }],
            },
            {
              name: "Operations",
              icon: BarChart3,
              items: [
                {
                  name: "Activities",
                  href: "/admin/activities",
                  icon: Activity,
                },
                { name: "Reports", href: "/admin/reports", icon: FileText },
                { name: "Billing", href: "/admin/billing", icon: DollarSign },
                { name: "Packages", href: "/admin/packages", icon: Package },
                {
                  name: "Scheduling",
                  href: "/admin/scheduling",
                  icon: Calendar,
                },
              ],
            },
            {
              name: "System",
              icon: Cog,
              items: [
                { name: "Settings", href: "/admin/settings", icon: Settings },
                { name: "Audit Logs", href: "/admin/audit-logs", icon: Shield },
              ],
            },
            {
              name: "Resources",
              icon: BookOpen,
              items: [
                {
                  name: "Education",
                  href: "/admin/education",
                  icon: GraduationCap,
                },
                {
                  name: "Communication",
                  href: "/admin/communication",
                  icon: Phone,
                },
              ],
            },
          ],
        };

      case "reviewer":
        return {
          items: [
            ...baseItems,
            {
              name: "Prescriptions",
              href: "/reviewer/patients",
              icon: Pill,
            },
            {
              name: "Patient Orders",
              href: "/reviewer/orders",
              icon: ShoppingCart,
            },
            {
              name: "Activity",
              href: "/reviewer/activities",
              icon: Activity,
            },
            {
              name: "Recommendations",
              href: "/reviewer/recommendations",
              icon: ClipboardList,
            },
          ],
          categories: [],
        };

      case "care_giver":
        return {
          items: [
            ...baseItems,
            {
              name: "My Patients",
              href: "/caregiver/patients",
              icon: Users,
            },
          ],
          categories: [],
        };

      case "patient":
        return {
          items: [
            ...baseItems,
            {
              name: "Care Plan",
              href: "/patient/care-plan",
              icon: ClipboardList,
            },
          ],
          categories: [],
        };

      default:
        return { items: baseItems, categories: [] };
    }
  };

  const navigation = getNavigationCategories();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "reviewer":
        return "bg-orange-100 text-orange-800";
      case "care_giver":
        return "bg-green-100 text-green-800";
      case "patient":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 relative">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="bg-teal-600 text-white p-2 rounded-lg">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-slate-900">ARC</span>
            </Link>
          </div>

          {/* Desktop Navigation - Absolutely Centered */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <nav className="flex items-center space-x-1">
              {/* Direct navigation items */}
              {navigation.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none ${
                      isActive ? "bg-accent text-accent-foreground" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Category dropdowns */}
              {navigation.categories.map((category) => {
                const CategoryIcon = category.icon;
                const hasActiveItem = category.items.some(
                  (item) => pathname === item.href
                );

                return (
                  <div key={category.name} className="relative group">
                    <button
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none ${
                        hasActiveItem ? "bg-accent text-accent-foreground" : ""
                      }`}
                    >
                      <CategoryIcon className="h-4 w-4 mr-2" />
                      {category.name}
                      <ChevronDown className="h-3 w-3 ml-1 transition-transform group-hover:rotate-180" />
                    </button>

                    {/* Dropdown menu positioned directly under this button */}
                    <div className="absolute top-full left-0 mt-1 w-[200px] bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                              isActive ? "bg-accent text-accent-foreground" : ""
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <ItemIcon className="h-4 w-4" />
                              <span className="text-sm font-medium leading-none">
                                {item.name}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Notifications */}
            <NotificationBell />

            {/* Profile Menu */}
            <div className="relative profile-menu-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-200 p-2 rounded-full">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <div className="text-sm font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                    <Badge
                      className={`${getRoleBadgeColor(user.role)} text-xs mt-1`}
                    >
                      {user.role === "super_admin"
                        ? "System Admin"
                        : user.role.replace("_", " ")}
                    </Badge>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <nav className="space-y-1">
              {/* Direct navigation items */}
              {navigation.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-teal-100 text-teal-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Category sections */}
              {navigation.categories.map((category) => (
                <div key={category.name} className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {category.name}
                  </div>
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-2 px-6 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-teal-100 text-teal-700"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </header>
  );
}
