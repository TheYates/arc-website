"use client";

import { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background w-full">
      {children}
      <Toaster />
    </div>
  );
}
