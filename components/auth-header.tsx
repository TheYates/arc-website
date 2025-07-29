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
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-menu")) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ARC</span>
            </div>
            <span className="font-bold text-xl">Alpha Rescue Consult</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationBell />

            {/* User Profile Menu */}
            <div className="relative profile-menu">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-teal-600" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                  {/* User Info */}
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <Badge
                      className={`mt-2 text-xs ${
                        user.role === "super_admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : user.role === "reviewer"
                          ? "bg-orange-100 text-orange-800"
                          : user.role === "care_giver"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {user.role === "super_admin"
                        ? "System Admin"
                        : user.role === "care_giver"
                        ? "Care Giver"
                        : user.role?.charAt(0).toUpperCase() +
                          user.role?.slice(1)}
                    </Badge>
                  </div>

                  {/* Profile Menu Items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
            <Link
              href="/"
              className="flex items-center space-x-2 px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
