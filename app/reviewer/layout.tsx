"use client";

import { ReactNode } from "react";
import { RoleBottomNav } from "@/components/mobile/role-bottom-nav";

export default function ReviewerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background w-full pb-20 md:pb-0">
      {children}
      <RoleBottomNav role="reviewer" />
    </div>
  );
}
