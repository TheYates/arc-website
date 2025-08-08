"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { usePathname } from "next/navigation";

export default function MorePage() {
  const pathname = usePathname();
  return (
    <div className="container mx-auto p-4 pb-24">
      <h1 className="text-2xl font-bold">More</h1>
      <p className="text-muted-foreground mb-4">
        Quick links to additional pages
      </p>
      <div className="space-y-2">
        {[
          { href: "/admin/services", label: "Admin • Services" },
          { href: "/admin/careers", label: "Admin • Careers" },
          { href: "/admin/applications", label: "Admin • Applications" },
          { href: "/profile", label: "Profile" },
          { href: "/settings", label: "Settings" },
        ].map((l) => (
          <Card key={l.href}>
            <CardContent className="p-3">
              <Link className="font-medium hover:underline" href={l.href}>
                {l.label}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
