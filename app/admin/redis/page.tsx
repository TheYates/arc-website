"use client";

import { RedisDashboard } from "@/components/admin/redis-dashboard";
import { AdminLayout } from "@/components/admin/admin-layout";

export default function RedisPage() {
  return (
    <AdminLayout breadcrumbs={[{ title: "Redis Cache", href: "/admin/redis" }]}>
      <RedisDashboard />
    </AdminLayout>
  );
}
