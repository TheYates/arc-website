"use client";

import { ReactNode } from "react";

import { QueryProvider } from "@/lib/query-client";

export default function CaregiverLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-background w-full">
        {children}
      </div>
    </QueryProvider>
  );
}
