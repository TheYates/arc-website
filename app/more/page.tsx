"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LogOut } from "lucide-react";

export default function MorePage() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

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

        {/* User Info and Logout */}
        {user && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
