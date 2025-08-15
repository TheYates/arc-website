"use client";

import { useState, useMemo, useCallback, memo, Suspense, lazy } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Removed Tabs import - no longer using tabs
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  ClipboardList,
  CheckCircle,
  Clock,
  CalendarClock,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Calendar,
  FileCheck,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  DashboardSkeleton,
  MobileDashboardSkeleton,
} from "@/components/admin/dashboard-skeleton";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useOptimizedAuth } from "@/hooks/use-optimized-auth";

// Lazy load mobile dashboard for better performance
const AdminMobileDashboard = lazy(() =>
  import("@/components/mobile/admin-dashboard").then((module) => ({
    default: module.AdminMobileDashboard,
  }))
);

// Memoized components for better performance
const StatCard = memo(({ stat }: { stat: any }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {stat.title}
          </p>
          <div className="flex items-baseline">
            <h3 className="text-3xl font-bold">{stat.value}</h3>
            {stat.change && (
              <span
                className={`ml-2 text-xs font-medium ${
                  stat.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
            )}
          </div>
          {stat.changeLabel && (
            <p className="text-xs text-muted-foreground">{stat.changeLabel}</p>
          )}
        </div>
        <div className="p-2 bg-primary/10 rounded-full">{stat.icon}</div>
      </div>
    </CardContent>
  </Card>
));

StatCard.displayName = "StatCard";

// Memoized Application Item Component
const ApplicationItem = memo(
  ({
    application,
    getStatusBadge,
  }: {
    application: any;
    getStatusBadge: (status: string) => JSX.Element;
  }) => (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={application.avatar} alt={application.name} />
          <AvatarFallback>{application.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{application.name}</p>
          <p className="text-sm text-muted-foreground">{application.service}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        {getStatusBadge(application.status)}
        <span className="text-xs text-muted-foreground mt-1">
          {application.date}
        </span>
      </div>
    </div>
  )
);

ApplicationItem.displayName = "ApplicationItem";

// Memoized Activity Item Component
const ActivityItem = memo(
  ({
    activity,
    getActivityIcon,
  }: {
    activity: any;
    getActivityIcon: (type: string) => JSX.Element;
  }) => (
    <div className="flex gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
      <div className="mt-1">{getActivityIcon(activity.type)}</div>
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <p className="font-medium">{activity.action}</p>
          <span className="text-xs text-muted-foreground">{activity.time}</span>
        </div>
        <p className="text-sm text-muted-foreground">{activity.description}</p>
        <div className="flex items-center mt-1">
          <Avatar className="h-5 w-5 mr-1">
            <AvatarImage src={activity.avatar} alt={activity.user} />
            <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{activity.user}</span>
        </div>
      </div>
    </div>
  )
);

ActivityItem.displayName = "ActivityItem";

export default function AdminDashboardPage() {
  const { userProfile, isLoading: authLoading } = useOptimizedAuth();
  const {
    data: dashboardData,
    isLoading: dataLoading,
    error,
  } = useDashboardData();
  // Removed selectedTab state - no longer using tabs

  // Memoized data with icons added
  const stats = useMemo(() => {
    if (!dashboardData?.stats) return [];

    const iconMap = {
      "Total Patients": <Users className="h-5 w-5 text-primary" />,
      "New Applications": <ClipboardList className="h-5 w-5 text-primary" />,
      "Pending Approvals": <Clock className="h-5 w-5 text-primary" />,
      "Scheduled Consultations": (
        <CalendarClock className="h-5 w-5 text-primary" />
      ),
    };

    return dashboardData.stats.map((stat) => ({
      ...stat,
      icon: iconMap[stat.title as keyof typeof iconMap] || (
        <Users className="h-5 w-5 text-primary" />
      ),
    }));
  }, [dashboardData?.stats]);

  const recentApplications = useMemo(
    () => dashboardData?.recentApplications || [],
    [dashboardData?.recentApplications]
  );

  const recentActivities = useMemo(
    () => dashboardData?.recentActivities || [],
    [dashboardData?.recentActivities]
  );

  const upcomingConsultations = useMemo(
    () => dashboardData?.upcomingConsultations || [],
    [dashboardData?.upcomingConsultations]
  );

  const taskCompletion = useMemo(
    () => dashboardData?.taskCompletion || [],
    [dashboardData?.taskCompletion]
  );

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }, []);

  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case "approval":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejection":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "onboarding":
        return <FileCheck className="h-5 w-5 text-blue-500" />;
      case "assignment":
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-primary/20" />;
    }
  }, []);

  // Show loading skeleton while auth or data is loading
  if (authLoading || dataLoading) {
    return (
      <div className="space-y-6">
        {/* Mobile Loading */}
        <div className="md:hidden">
          <MobileDashboardSkeleton />
        </div>
        {/* Desktop Loading */}
        <div className="hidden md:block">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Show error state if data failed to load
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to load dashboard
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <Suspense fallback={<MobileDashboardSkeleton />}>
          <AdminMobileDashboard />
        </Suspense>
      </div>

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
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>
      </div>

      {/* Dashboard Overview Content */}
      <div className="hidden md:block space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Recent Applications */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Latest patient applications submitted
                </CardDescription>
              </div>
              <Link href="/admin/applications">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.slice(0, 3).map((application, index) => (
                  <ApplicationItem
                    key={application.id}
                    application={application}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
              <CardFooter className="pt-6 px-0 border-t mt-4">
                <div className="flex justify-between items-center w-full text-muted-foreground text-sm">
                  <div>
                    Showing 3 of {recentApplications.length} applications
                  </div>
                  <Link
                    href="/admin/applications"
                    className="flex items-center hover:text-foreground"
                  >
                    See all applications{" "}
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </CardFooter>
            </CardContent>
          </Card>

          {/* Task Completion */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle>Task Completion</CardTitle>
              <CardDescription>
                Your team's progress on key tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {taskCompletion.map((task, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{task.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {task.completed} of {task.total}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={task.percentage} />
                    <div className="text-xs text-right text-muted-foreground">
                      {task.percentage}% complete
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Upcoming Consultations */}
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

          {/* Recent Activities */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest actions taken in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    getActivityIcon={getActivityIcon}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
