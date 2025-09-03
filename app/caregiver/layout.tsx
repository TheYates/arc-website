"use client";

import { ReactNode } from "react";
import { RoleBottomNav } from "@/components/mobile/role-bottom-nav";
import { QueryProvider } from "@/lib/query-client";

export default function CaregiverLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-background w-full pb-20 md:pb-0">
        {children}
        <RoleBottomNav role="caregiver" />
      </div>
    </QueryProvider>
  );
}
