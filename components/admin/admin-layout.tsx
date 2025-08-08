"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RoleBottomNav } from "@/components/mobile/role-bottom-nav";

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: {
    title: string;
    href?: string;
  }[];
}

export function AdminLayout({ children, breadcrumbs }: AdminLayoutProps) {
  return (
    <div className="[--header-height:calc(theme(spacing.12))] min-h-screen pb-20 md:pb-0">
      <SidebarProvider>
        <AdminHeader breadcrumbs={breadcrumbs} />
        <div className="flex flex-1 pt-[--header-height]">
          <div className="hidden md:block">
            <AdminSidebar />
          </div>
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
      {/* Mobile bottom nav */}
      <RoleBottomNav role="admin" />
    </div>
  );
}
