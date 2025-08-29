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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {user?.firstName || "Caregiver"} 👋
        </h1>
        <p className="text-muted-foreground text-sm">{formatDate(now)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Ready to provide exceptional care today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Active Patients</div>
                <div className="text-2xl font-bold mt-1 text-teal-600">0</div>
              </div>
              <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-full">
                <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Today's Tasks</div>
                <div className="text-2xl font-bold mt-1 text-blue-600">0</div>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <ClipboardCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Actions */}
      <div className="space-y-3">
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
              <Users className="h-4 w-4 mr-2" /> Patients
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/caregiver/notifications">
              <Bell className="h-4 w-4 mr-2" /> 
              <span className="relative">
                Notifications
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
              </span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Updates */}
      <Card>
        <CardContent className="p-4">
          <div className="font-medium text-sm mb-3 flex items-center">
            <Bell className="h-4 w-4 mr-2 text-teal-600" />
            Recent Updates
          </div>
          <div className="space-y-3">
            <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded border border-teal-200 dark:border-teal-700">
              <p className="text-xs font-medium text-teal-900 dark:text-teal-100">
                Welcome to Alpha Rescue!
              </p>
              <p className="text-xs text-teal-700 dark:text-teal-300 mt-1">
                Complete your profile to get started.
              </p>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
              <p className="text-xs font-medium text-green-900 dark:text-green-100">
                Training Available
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                New protocols training available.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Button 
        variant="outline" 
        className="w-full border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/10" 
        asChild
      >
        <Link href="tel:+233XXXXXXXXX">
          <Phone className="h-4 w-4 mr-2 text-red-600" /> 
          <span className="text-red-600 dark:text-red-400 font-medium">Emergency Line</span>
        </Link>
      </Button>
    </div>
  );
}
