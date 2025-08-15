"use client";

import Link from "next/link";
import { useMemo, memo } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Users,
  ClipboardList,
  UserPlus,
  Briefcase,
  ArrowRight,
} from "lucide-react";

// Memoized Stat Card Component
const MobileStatCard = memo(({ stat }: { stat: any }) => (
  <Card>
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{stat.label}</p>
        <p className="text-xl font-semibold">{stat.value}</p>
      </div>
      {stat.icon}
    </CardContent>
  </Card>
));

MobileStatCard.displayName = "MobileStatCard";

export function AdminMobileDashboard() {
  const { user } = useAuth();

  const now = useMemo(() => new Date(), []);
  const timeStr = useMemo(
    () =>
      now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [now]
  );

  // Memoized demo stats — wire to real data when ready
  const stats = useMemo(
    () => [
      {
        label: "Patients",
        value: "—",
        icon: <Users className="h-5 w-5 text-primary" />,
      },
      {
        label: "Apps",
        value: "—",
        icon: <ClipboardList className="h-5 w-5 text-primary" />,
      },
    ],
    []
  );

  const recents: Array<{
    id: string;
    name: string;
    service: string;
    status: string;
    date: Date;
  }> = [];

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Hi {user?.firstName || "Admin"}</h1>
        <p className="text-muted-foreground">
          {formatDate(now)} • {timeStr}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <MobileStatCard key={s.label} stat={s} />
        ))}
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="w-full">
          <Link href="/admin/applications">
            <ClipboardList className="h-4 w-4 mr-2" /> Applications
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/admin/users">
            <UserPlus className="h-4 w-4 mr-2" /> Users
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/admin/careers">
            <Briefcase className="h-4 w-4 mr-2" /> Careers
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/admin/services">
            <Users className="h-4 w-4 mr-2" /> Services
          </Link>
        </Button>
      </div>

      {/* Recents */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Recent Applications</div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/applications">
                See all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          {recents.length === 0 ? (
            <div className="text-sm text-muted-foreground mt-2">
              No recent applications.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {recents.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.service}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
