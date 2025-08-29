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
import { CaregiverMobileDashboard } from "@/components/mobile/caregiver-dashboard";
import { RoleBottomNav } from "@/components/mobile/role-bottom-nav";
import { useAuth, hasPermission } from "@/lib/auth";
import { getPatientsByCaregiver } from "@/lib/api/assignments";
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
} from "lucide-react";

export default function CaregiverPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAssignedPatients = async () => {
      if (!user) return;

      setIsLoadingPatients(true);
      try {
        const patients = await getPatientsByCaregiver(user.id);
        setAssignedPatients(patients);
      } catch (error) {
        console.error("Failed to fetch assigned patients:", error);
      } finally {
        setIsLoadingPatients(false);
      }
    };

    fetchAssignedPatients();
  }, [user]);

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

  if (!user || user.role !== "caregiver") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground">
            Access denied. Caregiver role required.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <RoleHeader role="caregiver" />

      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <CaregiverMobileDashboard />
      </div>

      {/* Desktop */}
      <main className="hidden md:block container mx-auto px-4 py-6 max-w-7xl space-y-6">
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
                    <h3 className="text-3xl font-bold text-teal-600">{assignedPatients.length}</h3>
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
                    <h3 className="text-3xl font-bold text-blue-600">0</h3>
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
                    <h3 className="text-3xl font-bold text-green-600">0</h3>
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
                    <h3 className="text-3xl font-bold text-purple-600">2</h3>
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
                <Badge variant="outline" className="text-xs">{assignedPatients.length}/8</Badge>
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
                      View All {assignedPatients.length} Patients
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
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No appointments scheduled
                </h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any patient appointments or tasks scheduled for
                  today.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    View Full Schedule
                  </Button>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Browse Available Shifts
                  </Button>
                </div>
              </div>
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

          {/* Recent Notifications */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Bell className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
                Recent Updates
              </CardTitle>
              <CardDescription>Latest notifications and system messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-teal-100 dark:bg-teal-800 rounded-full mt-0.5">
                    <CheckCircle className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-teal-900 dark:text-teal-100 text-sm">
                      Welcome to Alpha Rescue!
                    </p>
                    <p className="text-xs text-teal-800 dark:text-teal-300 mt-1">
                      Complete your profile to get started with patient assignments.
                    </p>
                    <p className="text-xs text-teal-700 dark:text-teal-400 mt-2">
                      {formatDate(new Date())}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 dark:bg-green-800 rounded-full mt-0.5">
                    <Stethoscope className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-900 dark:text-green-100 text-sm">
                      Training Available
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      New care protocols training is now available in your learning portal.
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      2 hours ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  <p className="text-sm text-red-700 dark:text-red-300">+233 XX XXX XXXX</p>
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
                    support@alpharescue.com
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mon-Fri, 8AM-6PM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold">Main Office</p>
                  <p className="text-sm text-muted-foreground">Accra, Ghana</p>
                  <p className="text-xs text-muted-foreground">
                    Regional Headquarters
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
