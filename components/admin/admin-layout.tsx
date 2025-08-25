"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { RoleBottomNav } from "@/components/mobile/role-bottom-nav";
import { Toaster } from "@/components/ui/toaster";
import { ModeToggle } from "@/components/mode-toggle";

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: {
    title: string;
    href?: string;
  }[];
}

// Helper function to generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  // Skip the first segment if it's 'admin'
  const adminIndex = segments.indexOf('admin');
  if (adminIndex !== -1) {
    segments.splice(adminIndex, 1);
  }

  // Map of route segments to display names
  const routeNames: Record<string, string> = {
    'applications': 'Applications',
    'careers': 'Careers',
    'patients': 'Patients',
    'services': 'Services',
    'logos': 'Logos',
    'users': 'Users',
    'settings': 'Settings',
    'support': 'Support',
  };

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;
    const href = `/admin/${segments.slice(0, i + 1).join('/')}`;

    breadcrumbs.push({
      title: routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : href,
    });
  }

  return breadcrumbs;
}

export function AdminLayout({ children, breadcrumbs }: AdminLayoutProps) {
  const pathname = usePathname();
  const autoBreadcrumbs = generateBreadcrumbs(pathname);
  const finalBreadcrumbs = breadcrumbs || autoBreadcrumbs;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/admin">
                      Admin Panel
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {finalBreadcrumbs && finalBreadcrumbs.length > 0 && (
                    <>
                      <BreadcrumbSeparator className="hidden md:block" />
                      {finalBreadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <BreadcrumbSeparator />}
                          <BreadcrumbItem>
                            {crumb.href ? (
                              <BreadcrumbLink href={crumb.href}>
                                {crumb.title}
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      ))}
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
              <div className="ml-auto">
                <ModeToggle />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      {/* Mobile bottom nav */}
      <RoleBottomNav role="admin" />
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
