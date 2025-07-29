"use client";

import { useState } from "react";
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
  FileText,
  Home,
  Plus,
  Settings,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  // Removed selectedTab state - no longer using tabs

  // Demo data - in a real app, this would come from an API call
  const stats = [
    {
      title: "Total Patients",
      value: 37,
      icon: <Users className="h-5 w-5 text-primary" />,
      change: "+5%",
      changeValue: 5,
      changeLabel: "from last month",
      positive: true,
    },
    {
      title: "New Applications",
      value: 12,
      icon: <ClipboardList className="h-5 w-5 text-primary" />,
      change: "+2",
      changeValue: 2,
      changeLabel: "since yesterday",
      positive: true,
    },
    {
      title: "Pending Approvals",
      value: 7,
      icon: <Clock className="h-5 w-5 text-primary" />,
      change: "",
      changeValue: 0,
      changeLabel: "",
      positive: true,
    },
    {
      title: "Scheduled Consultations",
      value: 24,
      icon: <CalendarClock className="h-5 w-5 text-primary" />,
      change: "+3",
      changeValue: 3,
      changeLabel: "this week",
      positive: true,
    },
  ];

  const recentApplications = [
    {
      id: "app-001",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      service: "AHENEFIE",
      date: "2023-09-15",
      status: "pending",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: "app-002",
      name: "Michael Smith",
      email: "m.smith@example.com",
      service: "ADAMFO PA",
      date: "2023-09-14",
      status: "approved",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: "app-003",
      name: "Emma Thompson",
      email: "emma.t@example.com",
      service: "YONKO PA",
      date: "2023-09-14",
      status: "pending",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: "app-004",
      name: "Daniel Brown",
      email: "d.brown@example.com",
      service: "FIE NE FIE",
      date: "2023-09-13",
      status: "rejected",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: "app-005",
      name: "Jessica Wilson",
      email: "j.wilson@example.com",
      service: "AHENEFIE",
      date: "2023-09-12",
      status: "approved",
      avatar: "/placeholder-user.jpg",
    },
  ];

  const recentActivities = [
    {
      id: "act-001",
      action: "Patient approved",
      user: "Admin User",
      userId: "admin1",
      time: "Just now",
      description: "Approved application for Sarah Johnson",
      avatar: "/placeholder-user.jpg",
      type: "approval",
    },
    {
      id: "act-002",
      action: "Patient onboarded",
      user: "Admin User",
      userId: "admin1",
      time: "1 hour ago",
      description: "Completed onboarding for Michael Smith",
      avatar: "/placeholder-user.jpg",
      type: "onboarding",
    },
    {
      id: "act-003",
      action: "Application rejected",
      user: "Admin User",
      userId: "admin1",
      time: "2 hours ago",
      description: "Rejected application for Daniel Brown",
      avatar: "/placeholder-user.jpg",
      type: "rejection",
    },
    {
      id: "act-004",
      action: "Caregiver assigned",
      user: "Admin User",
      userId: "admin1",
      time: "5 hours ago",
      description: "Assigned Nurse Ama to Jessica Wilson",
      avatar: "/placeholder-user.jpg",
      type: "assignment",
    },
  ];

  const upcomingConsultations = [
    {
      id: "cons-001",
      patientName: "Sarah Johnson",
      patientId: "pat-001",
      type: "Initial Assessment",
      date: "Today",
      time: "2:30 PM",
      duration: "45 minutes",
      careGiver: "Dr. Kofi Mensah",
    },
    {
      id: "cons-002",
      patientName: "Michael Smith",
      patientId: "pat-002",
      type: "Follow-up",
      date: "Tomorrow",
      time: "10:00 AM",
      duration: "30 minutes",
      careGiver: "Nurse Ama Owusu",
    },
    {
      id: "cons-003",
      patientName: "Emma Thompson",
      patientId: "pat-003",
      type: "Medical Review",
      date: "Sep 20, 2023",
      time: "1:15 PM",
      duration: "60 minutes",
      careGiver: "Dr. Kofi Mensah",
    },
  ];

  const taskCompletion = [
    {
      title: "Application Reviews",
      completed: 5,
      total: 12,
      percentage: 42,
    },
    {
      title: "Patient Onboarding",
      completed: 3,
      total: 7,
      percentage: 43,
    },
    {
      title: "Schedule Setup",
      completed: 18,
      total: 24,
      percentage: 75,
    },
  ];

  const quickLinks = [
    {
      title: "New Application",
      icon: <FileText className="h-5 w-5" />,
      href: "/admin/applications",
      color: "bg-primary",
    },
    {
      title: "Add Patient",
      icon: <UserPlus className="h-5 w-5" />,
      href: "/admin/patients",
      color: "bg-primary",
    },
    {
      title: "Schedule",
      icon: <Calendar className="h-5 w-5" />,
      href: "/admin/scheduling",
      color: "bg-primary",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
      color: "bg-primary",
    },
  ];

  function getStatusBadge(status: string) {
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
  }

  function getActivityIcon(type: string) {
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
  }

  return (
    <div className="space-y-6">
      {/* Header & Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}! Here's your overview for today.
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

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link, index) => (
          <Link href={link.href} key={index} className="block">
            <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`${link.color} p-2 rounded-lg text-white`}>
                  {link.icon}
                </div>
                <div className="font-medium">{link.title}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Dashboard Overview Content */}
      <div className="space-y-6">
        {/* Stats Cards */}
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
                      <p className="text-xs text-muted-foreground">
                        {stat.changeLabel}
                      </p>
                    )}
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={application.avatar}
                          alt={application.name}
                        />
                        <AvatarFallback>
                          {application.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{application.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.service}
                        </p>
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
                  <div
                    key={index}
                    className="flex gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.action}</p>
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-1">
                        <Avatar className="h-5 w-5 mr-1">
                          <AvatarImage
                            src={activity.avatar}
                            alt={activity.user}
                          />
                          <AvatarFallback>
                            {activity.user.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {activity.user}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
