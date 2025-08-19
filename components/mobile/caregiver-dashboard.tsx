"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Users, ClipboardCheck, ClipboardList, Calendar, Bell, Phone } from "lucide-react";

export function CaregiverMobileDashboard() {
  const { user } = useAuth();
  const now = new Date();

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {user?.firstName || "Caregiver"}
        </h1>
        <p className="text-muted-foreground">{formatDate(now)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Active Patients</div>
            <div className="text-2xl font-semibold mt-1">—</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Today's Tasks</div>
            <div className="text-2xl font-semibold mt-1">—</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="w-full">
          <Link href="/caregiver/service-requests">
            <ClipboardList className="h-4 w-4 mr-2" /> Requests
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/caregiver/schedules">
            <Calendar className="h-4 w-4 mr-2" /> Schedule
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="w-full">
          <Link href="/caregiver/patients">
            <Users className="h-4 w-4 mr-2" /> My Patients
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/caregiver/notifications">
            <Bell className="h-4 w-4 mr-2" /> Notifications
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="font-medium">Recent Updates</div>
          <div className="text-sm text-muted-foreground mt-1">
            No new notifications.
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" asChild>
        <Link href="tel:+233XXXXXXXXX">
          <Phone className="h-4 w-4 mr-2" /> Emergency Line
        </Link>
      </Button>
    </div>
  );
}
