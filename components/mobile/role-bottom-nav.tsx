"use client";

import { MobileBottomNav, type BottomNavItem } from "./bottom-nav";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ClipboardList,
  Briefcase,
  UserPlus,
  Calendar,
  FileText,
  User,
  MoreHorizontal,
} from "lucide-react";

interface RoleBottomNavProps {
  role: "admin" | "reviewer" | "caregiver" | "patient";
}

export function RoleBottomNav({ role }: RoleBottomNavProps) {
  const pathname = usePathname();
  const baseUrl = `/${role}`;

  let items: BottomNavItem[] = [];

  switch (role) {
    case "admin":
      items = [
        { label: "Home", href: baseUrl, icon: <Home className="h-5 w-5" /> },
        {
          label: "Apps",
          href: `${baseUrl}/applications`,
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          label: "Careers",
          href: `${baseUrl}/careers`,
          icon: <Briefcase className="h-5 w-5" />,
        },
        {
          label: "Users",
          href: `${baseUrl}/users`,
          icon: <UserPlus className="h-5 w-5" />,
        },
        {
          label: "More",
          href: `/more`,
          icon: <MoreHorizontal className="h-5 w-5" />,
        },
      ];
      break;
    case "reviewer":
      items = [
        { label: "Home", href: baseUrl, icon: <Home className="h-5 w-5" /> },
        {
          label: "Patients",
          href: `${baseUrl}/patients`,
          icon: <Users className="h-5 w-5" />,
        },
        {
          label: "Tasks",
          href: `${baseUrl}/tasks`,
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          label: "Profile",
          href: `/profile`,
          icon: <User className="h-5 w-5" />,
        },
        {
          label: "More",
          href: `/more`,
          icon: <MoreHorizontal className="h-5 w-5" />,
        },
      ];
      break;
    case "caregiver":
      items = [
        { label: "Home", href: baseUrl, icon: <Home className="h-5 w-5" /> },
        {
          label: "Patients",
          href: `${baseUrl}/patients`,
          icon: <Users className="h-5 w-5" />,
        },
        {
          label: "Schedule",
          href: `${baseUrl}/schedule`,
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          label: "Profile",
          href: `/profile`,
          icon: <User className="h-5 w-5" />,
        },
        {
          label: "More",
          href: `/more`,
          icon: <MoreHorizontal className="h-5 w-5" />,
        },
      ];
      break;
    case "patient":
      items = [
        { label: "Home", href: baseUrl, icon: <Home className="h-5 w-5" /> },
        {
          label: "Appts",
          href: `${baseUrl}/appointments`,
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          label: "Plan",
          href: `${baseUrl}/care-plan`,
          icon: <FileText className="h-5 w-5" />,
        },
        {
          label: "Profile",
          href: `/profile`,
          icon: <User className="h-5 w-5" />,
        },
        {
          label: "More",
          href: `/more`,
          icon: <MoreHorizontal className="h-5 w-5" />,
        },
      ];
      break;
  }

  // Precompute active flags to reduce re-eval in children
  const itemsWithActive = items.map((it) => ({
    ...it,
    isActive: pathname === it.href || pathname?.startsWith(it.href + "/"),
  }));

  return <MobileBottomNav items={itemsWithActive} />;
}
