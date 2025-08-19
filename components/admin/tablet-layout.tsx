"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminHeader } from "@/components/admin/admin-header";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Menu, X } from "lucide-react";

interface TabletLayoutProps {
  children: React.ReactNode;
}

export function TabletLayout({ children }: TabletLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with hamburger menu for tablets */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-full flex-col">
                  <div className="flex h-14 items-center justify-between px-4 border-b">
                    <h2 className="text-lg font-semibold">Admin Panel</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <AppSidebar />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-semibold">Admin</span>
            </div>
          </div>

          {/* Header Actions */}
          <AdminHeader />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

// Tablet-optimized navigation component
export function TabletNavigation() {
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Applications", href: "/admin/applications", icon: "📋" },
    { name: "Patients", href: "/admin/patients", icon: "👥" },
    { name: "Services", href: "/admin/services", icon: "📦" },
    { name: "Logos", href: "/admin/logos", icon: "🖼️" },
    { name: "Users", href: "/admin/users", icon: "👤" },
  ];

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1 overflow-x-auto py-2">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 whitespace-nowrap"
              asChild
            >
              <a href={item.href} className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.name}</span>
              </a>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// Tablet-optimized card component
export function TabletCard({ 
  title, 
  description, 
  children, 
  action,
  className = "" 
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Tablet-optimized grid component
export function TabletGrid({ 
  children, 
  cols = 2,
  gap = 4,
  className = "" 
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
  gap?: 2 | 3 | 4 | 6;
  className?: string;
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  const gridGap = {
    2: "gap-2",
    3: "gap-3", 
    4: "gap-4",
    6: "gap-6",
  };

  return (
    <div className={`grid ${gridCols[cols]} ${gridGap[gap]} ${className}`}>
      {children}
    </div>
  );
}

// Tablet-optimized stats component
export function TabletStats({ stats }: { stats: Array<{ title: string; value: string | number; change?: string; icon?: React.ReactNode }> }) {
  return (
    <TabletGrid cols={2} gap={4}>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.change && (
                  <span className="text-xs text-green-600 font-medium">
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
            {stat.icon && (
              <div className="p-2 bg-primary/10 rounded-full">
                {stat.icon}
              </div>
            )}
          </div>
        </div>
      ))}
    </TabletGrid>
  );
}
