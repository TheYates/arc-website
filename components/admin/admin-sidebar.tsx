"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth"
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Home,
  LifeBuoy,
  Package,
  Settings,
  Shield,
  UserPlus,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const adminData = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "", // Use empty string to fallback to initials
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
      isActive: true,
    },
    {
      title: "Applications",
      url: "/admin/applications",
      icon: ClipboardList,
    },
    {
      title: "Careers",
      url: "/admin/careers",
      icon: Briefcase,
    },
    {
      title: "Patients",
      url: "/admin/patients",
      icon: Users,
    },
    {
      title: "Services",
      url: "/admin/services",
      icon: Package,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: UserPlus,
    },
  ],
  projects: [
    {
      name: "Patient Management",
      url: "/admin/patients",
      icon: Users,
    },
    {
      name: "Applications",
      url: "/admin/applications",
      icon: ClipboardList,
    },
    {
      name: "Career Portal",
      url: "/admin/careers",
      icon: Briefcase,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/admin/support",
      icon: LifeBuoy,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Create user data for sidebar
  const userData = {
    name: user ? `${user.firstName} ${user.lastName}` : "Admin User",
    email: user?.email || "admin@example.com",
    avatar: "", // Use empty string to fallback to initials
  }

  return (
    <Sidebar
      className="top-[--header-height] h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Admin Panel</span>
                  <span className="truncate text-xs">Management</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminData.navMain} />
        <NavProjects projects={adminData.projects} />
        <NavSecondary items={adminData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
