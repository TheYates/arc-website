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
    <div className="min-h-screen bg-background w-full">
      {/* Header Navigation */}
      <RoleHeader role="caregiver" />

      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <CaregiverMobileDashboard />
      </div>

      {/* Desktop */}
      <main className="hidden md:block container mx-auto px-4 py-6 w-full max-w-7xl space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 border-teal-200 dark:border-teal-700">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-teal-900 dark:text-teal-100">
                  Welcome back, {user.firstName}! 👋
                </h1>
                <p className="text-teal-700 dark:text-teal-300 mt-1 text-lg">
                  {formatFullDate(currentTime)} • {formatTime(currentTime)}
                </p>
                <p className="text-teal-600 dark:text-teal-400 mt-2">
                  Ready to provide exceptional care today
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-right text-sm text-teal-700 dark:text-teal-300">
                  <div>🌡️ Today: 24°C, Sunny</div>
                  <div>📍 Accra, Ghana</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Patients
                  </p>
                  <p className="text-3xl font-bold text-teal-600">0</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assigned to you
                  </p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Today's Tasks
                  </p>
                  <p className="text-3xl font-bold text-blue-600">0</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pending completion
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ClipboardCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Hours This Week
                  </p>
                  <p className="text-3xl font-bold text-green-600">0</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Out of 40 scheduled
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Notifications
                  </p>
                  <p className="text-3xl font-bold text-purple-600">2</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unread messages
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Bell className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Patients for Care */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-teal-600" />
                  My Patients for Care
                </div>
                <Badge variant="outline">{assignedPatients.length}/8</Badge>
              </CardTitle>
              <CardDescription>Patients assigned to your care</CardDescription>
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
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
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

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Activity className="h-5 w-5 mr-2 text-teal-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks and tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Update My Profile
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Log Care Activity
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Schedule Change
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Supervisor
                </Button>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Bell className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-teal-700 dark:text-teal-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-teal-900 dark:text-teal-100">
                          Welcome to Alpha Rescue!
                        </p>
                        <p className="text-sm text-teal-800 dark:text-teal-300 mt-1">
                          Complete your profile to get started with patient
                          assignments.
                        </p>
                        <p className="text-xs text-teal-700 dark:text-teal-400 mt-2">
                          {formatDate(new Date())}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900 dark:text-green-100">
                          Training Available
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          New care protocols training is now available in your
                          learning portal.
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Contact Information */}
        <Card>
          <CardHeader>
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
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-red-50 border-red-200">
                <div className="p-2 bg-red-100 rounded-full">
                  <Phone className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-900">Emergency</p>
                  <p className="text-sm text-red-700">+233 XX XXX XXXX</p>
                  <p className="text-xs text-red-600">24/7 Emergency Line</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600" />
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

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <MapPin className="h-5 w-5 text-green-600" />
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
