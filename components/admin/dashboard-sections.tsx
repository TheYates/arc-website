"use client";

import React, { memo } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  FileCheck,
} from "lucide-react";
import { useDashboard } from "@/hooks/use-admin-dashboard-queries";

// Memoized Stats Section
export const DashboardStats = memo(() => {
  const { stats: dashboardStats, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: dashboardStats?.totalUsers || 0,
      icon: <Users className="h-5 w-5 text-primary" />,
      change: "+12%",
      positive: true,
    },
    {
      title: "Total Patients", 
      value: dashboardStats?.totalPatients || 0,
      icon: <Users className="h-5 w-5 text-primary" />,
      change: "+8%",
      positive: true,
    },
    {
      title: "Pending Applications",
      value: dashboardStats?.pendingApplications || 0,
      icon: <Clock className="h-5 w-5 text-primary" />,
      change: "-5%",
      positive: false,
    },
    {
      title: "Active Patients",
      value: dashboardStats?.activePatients || 0,
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
      change: "+15%",
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="flex items-baseline">
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                  <span
                    className={`ml-2 text-xs font-medium ${
                      stat.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">{stat.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

DashboardStats.displayName = "DashboardStats";

// Memoized Recent Applications Section
export const RecentApplicationsSection = memo(() => {
  const recentApplications = [
    {
      id: "1",
      name: "John Doe",
      service: "Home Care",
      status: "pending",
      date: "2 hours ago",
    },
    {
      id: "2", 
      name: "Jane Smith",
      service: "Medical Review",
      status: "approved",
      date: "1 day ago",
    },
    {
      id: "3",
      name: "Bob Johnson", 
      service: "Emergency Care",
      status: "pending",
      date: "3 hours ago",
    },
  ];

  const getStatusBadge = (status: string) => {
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
  };

  return (
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
          {recentApplications.slice(0, 3).map((application) => (
            <div
              key={application.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
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
          ))}
        </div>
        <CardFooter className="pt-6 px-0 border-t mt-4">
          <div className="flex justify-between items-center w-full text-muted-foreground text-sm">
            <div>Showing 3 of {recentApplications.length} applications</div>
            <Link
              href="/admin/applications"
              className="flex items-center hover:text-foreground"
            >
              See all applications <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
});

RecentApplicationsSection.displayName = "RecentApplicationsSection";

// Memoized Task Completion Section
export const TaskCompletionSection = memo(() => {
  const taskCompletion = [
    {
      title: "Patient Reviews",
      completed: 8,
      total: 12,
      percentage: 67,
    },
    {
      title: "Service Requests",
      completed: 15,
      total: 20,
      percentage: 75,
    },
    {
      title: "Medical Assessments",
      completed: 5,
      total: 8,
      percentage: 63,
    },
  ];

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle>Task Completion</CardTitle>
        <CardDescription>Your team's progress on key tasks</CardDescription>
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
  );
});

TaskCompletionSection.displayName = "TaskCompletionSection";

// Memoized Recent Activities Section
export const RecentActivitiesSection = memo(() => {
  const { activities, isLoading } = useDashboard();

  const getActivityIcon = (type: string) => {
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
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest actions taken in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-2">
                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse mt-1" />
                <div className="flex-grow space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest actions taken in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="mt-1">{getActivityIcon(activity.type)}</div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{activity.action}</p>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <div className="flex items-center mt-1">
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarFallback>{activity.user?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{activity.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

RecentActivitiesSection.displayName = "RecentActivitiesSection";
