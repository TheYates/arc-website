"use client";

import { RateLimitDashboard } from "@/components/admin/rate-limit-dashboard";

export default function RateLimitingPage() {
  return (
    <div className="container mx-auto py-6">
      <RateLimitDashboard />
    </div>
  );
}
