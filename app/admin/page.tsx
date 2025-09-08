"use client";

import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Bell,
  Calendar,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  DashboardSkeleton,
} from "@/components/admin/dashboard-skeleton";
import {
  DashboardStats,
  RecentApplicationsSection,
  TaskCompletionSection,
  RecentActivitiesSection
} from "@/components/admin/dashboard-sections";
import { useDashboard } from "@/hooks/use-admin-dashboard-queries";
import { useOptimizedAuth } from "@/hooks/use-optimized-auth";

// Components moved to dashboard-sections.tsx for better streaming support

export default function AdminDashboardPage() {
  const { userProfile, isLoading: authLoading } = useOptimizedAuth();

  // 🚀 TanStack Query - Replace manual dashboard data fetching
  const {
    isLoading: dataLoading,
    error,
    refetchAll,
  } = useDashboard();

  const upcomingConsultations = [
    {
      id: "1",
      patientName: "Alice Brown",
      time: "10:00 AM",
      type: "Follow-up",
      careGiver: "Dr. Smith",
      date: "Today",
      duration: "30 min",
    },
    {
      id: "2",
      patientName: "Charlie Wilson",
      time: "2:00 PM",
      type: "Initial Consultation",
      careGiver: "Dr. Johnson",
      date: "Today",
      duration: "45 min",
    },
  ];

  // Show loading skeleton while auth or data is loading
  if (authLoading || dataLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state if data failed to load
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to load dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button onClick={() => refetchAll()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header & Welcome */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.firstName}! Here's your overview for
              today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/streaming-demo">
                View Streaming Demo
              </a>
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>
        </div>

        {/* Dashboard Overview Content */}
        <div className="hidden md:block space-y-6">
          {/* Stats Cards with Streaming */}
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>}>
            <DashboardStats />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            {/* Recent Applications with Streaming */}
            <Suspense fallback={<div className="lg:col-span-3 h-96 bg-gray-100 rounded-lg animate-pulse" />}>
              <RecentApplicationsSection />
            </Suspense>

            {/* Task Completion with Streaming */}
            <Suspense fallback={<div className="lg:col-span-3 h-96 bg-gray-100 rounded-lg animate-pulse" />}>
              <TaskCompletionSection />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            {/* Upcoming Consultations - Static for now */}
            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle>Upcoming Consultations</CardTitle>
                <CardDescription>
                  Next scheduled patient consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingConsultations.map((consultation, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-medium">
                            {consultation.patientName}
                          </p>
                          <div>
                            <Badge variant="outline" className="ml-0 sm:ml-2">
                              {consultation.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              Caregiver:
                            </span>{" "}
                            {consultation.careGiver}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {consultation.date} at {consultation.time} (
                            {consultation.duration})
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities with Streaming */}
            <Suspense fallback={<div className="lg:col-span-3 h-96 bg-gray-100 rounded-lg animate-pulse" />}>
              <RecentActivitiesSection />
            </Suspense>
          </div>
        </div>
    </div>
  );
}
