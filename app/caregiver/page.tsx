"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandSearch } from "@/components/ui/command-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleHeader } from "@/components/role-header";

import { ActivityFeed } from "@/components/activity-feed/activity-feed";
import { useAuth, hasPermission } from "@/lib/auth";
import { useCaregiverDashboard, useCaregiverSchedules } from "@/hooks/use-caregiver-queries";
import { useContactInfo } from "@/hooks/use-contact-info";
import { Patient } from "@/lib/types/patients";
import { formatDate } from "@/lib/utils";
import {
  Heart,
  Users,
  Calendar,
  ClipboardCheck,
  Bell,
  User,
  Settings,
  LogOut,
  Activity,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Search,
  Menu,
  Home,
  FileText,
  UserCheck,
  MessageSquare,
  Eye,
  Stethoscope,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default function CaregiverPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🚀 TanStack Query - Replace manual data fetching
  const {
    patients: assignedPatients,
    stats,
    isLoading: isLoadingPatients,
    error,
    refetchAll,
  } = useCaregiverDashboard();

  // 🚀 TanStack Query - Get today's schedules
  const {
    data: schedules = [],
    isLoading: isLoadingSchedules,
    error: schedulesError,
  } = useCaregiverSchedules();

  // 🚀 Get contact information
  const { contactInfo } = useContactInfo();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Check permissions
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "caregiver") {
      router.push("/");
      return;
    }
  }, [user, router]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Filter today's schedules
  const getTodaysSchedules = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return schedules.filter((schedule: any) => {
      const scheduleDate = new Date(schedule.scheduledDate);
      return scheduleDate >= today && scheduleDate < tomorrow;
    });
  };

  const todaysSchedules = getTodaysSchedules();

  if (!user || user.role !== "caregiver") {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="caregiver" />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="text-muted-foreground">
              Access denied. Caregiver role required.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <RoleHeader role="caregiver" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {formatFullDate(currentTime)} • {formatTime(currentTime)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Ready to provide exceptional care today
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Log Activity
              </Button>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>🌡️ Today: 24°C, Sunny • 📍 Accra, Ghana</div>
            </div>
          </div>
        </div>

        {/* Profile Completion Notice */}
        {!user.profileComplete && (
          <Card className="border-amber-200 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Complete Your Profile
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Please complete your profile to access all caregiver
                    features and receive patient assignments.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => router.push("/profile")}
                  className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                >
                  Complete Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Patients
                  </p>
                  <div className="flex items-baseline">
                    <h3 className="text-3xl font-bold text-teal-600">{stats.activePatients}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Assigned to you
                  </p>
                </div>
                <div className="p-3 bg-teal-100 dark:bg-teal-900/20 rounded-full">
                  <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Today's Tasks
                  </p>
                  <div className="flex items-baseline">
                    <h3 className="text-3xl font-bold text-blue-600">{stats.todaysTasks}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pending completion
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <ClipboardCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Hours This Week
                  </p>
                  <div className="flex items-baseline">
                    <h3 className="text-3xl font-bold text-green-600">{stats.hoursThisWeek}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Out of 40 scheduled
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Notifications
                  </p>
                  <div className="flex items-baseline">
                    <h3 className="text-3xl font-bold text-purple-600">{stats.notifications}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Unread messages
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Bell className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* My Patients for Care */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="h-5 w-5 mr-2 text-teal-600" />
                    My Patients for Care
                  </CardTitle>
                  <CardDescription>Patients assigned to your care</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">{stats.activePatients}/8</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPatients ? (
                <div className="flex justify-center py-8">
                  <div className="space-y-4 w-full max-w-md">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ) : assignedPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No patients assigned for care yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your supervisor will assign patients to you
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedPatients.slice(0, 3).map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg border border-transparent hover:border-accent cursor-pointer transition-all duration-200"
                      onClick={() =>
                        router.push(`/caregiver/patients/${patient.id}`)
                      }
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-foreground">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient.serviceName || "General Care"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={
                            patient.careLevel === "high"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : patient.careLevel === "medium"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }
                        >
                          {patient.careLevel || "standard"}
                        </Badge>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                  {assignedPatients.length > 3 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => router.push("/caregiver/patients")}
                    >
                      View All {stats.activePatients} Patients
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                Today's Schedule & Assignments
              </CardTitle>
              <CardDescription>
                Your appointments, tasks, and patient care schedule for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSchedules ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : todaysSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    No appointments scheduled
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any patient appointments or tasks scheduled for today.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" asChild>
                      <Link href="/caregiver/schedules">
                        <Clock className="h-4 w-4 mr-2" />
                        View Full Schedule
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/caregiver/schedules">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Schedule
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysSchedules.slice(0, 4).map((schedule: any) => (
                    <div key={schedule.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-full">
                        <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {schedule.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(schedule.scheduledDate).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                          {schedule.patient && ` • ${schedule.patient.firstName} ${schedule.patient.lastName}`}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge
                          variant={
                            schedule.status === "SCHEDULED" ? "default" :
                            schedule.status === "IN_PROGRESS" ? "secondary" :
                            schedule.status === "COMPLETED" ? "outline" :
                            "destructive"
                          }
                          className="text-xs"
                        >
                          {schedule.status === "SCHEDULED" ? "Scheduled" :
                           schedule.status === "IN_PROGRESS" ? "In Progress" :
                           schedule.status === "COMPLETED" ? "Completed" :
                           schedule.status}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {todaysSchedules.length > 4 && (
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/caregiver/schedules">
                          View All {todaysSchedules.length} Schedules
                        </Link>
                      </Button>
                    </div>
                  )}

                  {todaysSchedules.length > 0 && (
                    <div className="pt-2 border-t">
                      <Button size="sm" className="w-full" asChild>
                        <Link href="/caregiver/schedules">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Schedule
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Secondary Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-2 text-teal-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => router.push("/profile")}
                  disabled
                >
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  disabled
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Log Activity
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  disabled
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Change
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  disabled
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Supervisor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <ActivityFeed
            className="lg:col-span-3"
            roleColor="teal"
            maxItems={5}
            showLoadMore={false}
          />
        </div>

        {/* Emergency Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Phone className="h-5 w-5 mr-2 text-red-600" />
              Emergency & Support Contacts
            </CardTitle>
            <CardDescription>
              Important contact information for emergencies and support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 hover:shadow-md transition-shadow">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">Emergency</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{contactInfo?.primaryPhone || "+233 XX XXX XXXX"}</p>
                  {contactInfo?.secondaryPhone && (
                    <p className="text-sm text-red-700 dark:text-red-300">{contactInfo.secondaryPhone}</p>
                  )}
                  <p className="text-xs text-red-600 dark:text-red-400">24/7 Emergency Line</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold">Support Team</p>
                  <p className="text-sm text-muted-foreground">
                    {contactInfo?.email || "support@alpharescue.com"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contactInfo?.supportHours || "Mon-Fri, 8AM-6PM"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold">Main Office</p>
                  <p className="text-sm text-muted-foreground">{contactInfo?.address || "Accra, Ghana"}</p>
                  <p className="text-xs text-muted-foreground">
                    Regional Headquarters
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
