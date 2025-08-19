"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, ClipboardList, Bell, Clock } from "lucide-react";

export function ReviewerMobileDashboard() {
  const { user } = useAuth();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Hi {user?.firstName || "Reviewer"}
        </h1>
        <p className="text-muted-foreground">
          {formatDate(now)} • {timeStr}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">My Patients</p>
              <p className="text-xl font-semibold">—</p>
            </div>
            <Users className="h-5 w-5 text-purple-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Tasks</p>
              <p className="text-xl font-semibold">—</p>
            </div>
            <ClipboardList className="h-5 w-5 text-blue-600" />
          </CardContent>
        </Card>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="w-full">
          <Link href="/reviewer/service-requests">
            <ClipboardList className="h-4 w-4 mr-2" /> Requests
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/reviewer/patients">
            <Users className="h-4 w-4 mr-2" /> Patients
          </Link>
        </Button>
      </div>

      {/* Notifications */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-600" />
              <span className="font-medium">Notifications</span>
            </div>
            <span className="text-xs text-muted-foreground">Newest</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="text-sm text-muted-foreground">
              You're all caught up for now.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule CTA */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium">Today's schedule</div>
            <div className="text-xs text-muted-foreground">
              No upcoming events
            </div>
          </div>
          <Clock className="h-5 w-5 text-teal-600" />
        </CardContent>
      </Card>
    </div>
  );
}
