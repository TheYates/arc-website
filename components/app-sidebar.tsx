"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  BarChart3,
  Briefcase,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Home,
  Image,
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
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"
import { usePathname } from "next/navigation"

// Admin sidebar data
const getAdminData = (user: any, pathname: string) => ({
  user: {
    name: user ? `${user.firstName} ${user.lastName}` : "Admin User",
    email: user?.email || "admin@example.com",
    avatar: "", // Use empty string to fallback to initials
  },
  teams: [
    {
      name: "Alpha Rescue Consult",
      logo: Shield,
      plan: "Admin Panel",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
      isActive: pathname === "/admin",
    },
    {
      title: "Applications",
      url: "/admin/applications",
      icon: ClipboardList,
      isActive: pathname.startsWith("/admin/applications"),
    },
    {
      title: "Careers",
      url: "/admin/careers",
      icon: Briefcase,
      isActive: pathname.startsWith("/admin/careers"),
    },
    {
      title: "Patients",
      url: "/admin/patients",
      icon: Users,
      isActive: pathname.startsWith("/admin/patients"),
    },
    {
      title: "Services",
      url: "/admin/services",
      icon: Package,
      isActive: pathname.startsWith("/admin/services"),
    },
    {
      title: "Logos",
      url: "/admin/logos",
      icon: Image,
      isActive: pathname.startsWith("/admin/logos"),
    },
    {
      title: "Service Requests",
      url: "/admin/service-requests",
      icon: ClipboardCheck,
      isActive: pathname.startsWith("/admin/service-requests"),
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: UserPlus,
      isActive: pathname.startsWith("/admin/users"),
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
      isActive: pathname.startsWith("/admin/settings"),
    },
  ],
  projects: [
    {
      name: "System Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      name: "Reports",
      url: "/admin/reports",
      icon: FileText,
    },
    {
      name: "Audit Logs",
      url: "/admin/audit",
      icon: Shield,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Support",
      url: "/admin/support",
      icon: LifeBuoy,
    },
  ],
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const pathname = usePathname();
  const data = getAdminData(user, pathname);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
