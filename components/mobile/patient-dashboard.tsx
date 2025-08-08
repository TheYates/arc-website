"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText } from "lucide-react";

export function PatientMobileDashboard() {
  const { user } = useAuth();

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {user?.firstName || "Patient"}
        </h1>
        <p className="text-muted-foreground text-sm">Your care at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              Next Appointment
            </div>
            <div className="text-sm mt-1">No upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Care Plan</div>
            <div className="text-sm mt-1">Available</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="w-full">
          <Link href="/patient/appointments">
            <Calendar className="h-4 w-4 mr-2" /> Appointments
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/patient/care-plan">
            <FileText className="h-4 w-4 mr-2" /> Care Plan
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="font-medium">Recent Activity</div>
          <div className="text-sm text-muted-foreground mt-1">
            No recent activity.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
