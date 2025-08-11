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
import { ReviewerMobileDashboard } from "@/components/mobile/reviewer-dashboard";
import { RoleBottomNav } from "@/components/mobile/role-bottom-nav";
import { useAuth } from "@/lib/auth";
import { getPatientsByReviewer } from "@/lib/api/assignments";
import { Patient } from "@/lib/types/patients";
import {
  Heart,
  Users,
  Calendar,
  ClipboardList,
  Bell,
  User,
  Settings,
  LogOut,
  Activity,
  Clock,
  FileText,
  UserCheck,
  MessageSquare,
  Eye,
  CheckCircle,
  Home,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";

export default function ReviewerPage() {
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
        const patients = await getPatientsByReviewer(user.id);
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

    if (user.role !== "reviewer") {
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user || user.role !== "reviewer") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground">
            Access denied. Reviewer role required.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header Navigation */}
      <RoleHeader role="reviewer" />

      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <ReviewerMobileDashboard />
      </div>

      {/* Desktop */}
      <main className="hidden md:block container mx-auto px-4 py-6 w-full max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold ">
                Good{" "}
                {new Date().getHours() < 12
                  ? "morning"
                  : new Date().getHours() < 18
                  ? "afternoon"
                  : "evening"}
                , {user?.firstName}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge className="bg-purple-100 text-purple-800">
                <Eye className="h-3 w-3 mr-1" />
                Medical Reviewer
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Patients */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Assigned Patients
                  </p>
                  <p className="text-2xl font-bold">
                    {isLoadingPatients ? "..." : assignedPatients.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Reviews
                  </p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed This Week */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Reviews This Week
                  </p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Priority Cases */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Priority Cases
                  </p>
                  <p className="text-2xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Patients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  My Patients for Review
                </div>
                <Badge variant="outline">{assignedPatients.length}/5</Badge>
              </CardTitle>
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
                    No patients assigned for review yet
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
                      className="flex items-center justify-between p-3 hover:accent rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient.serviceName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            patient.careLevel === "high"
                              ? "bg-red-100 text-red-800"
                              : patient.careLevel === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {patient.careLevel}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/reviewer/patients/${patient.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {assignedPatients.length > 3 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => router.push("/reviewer/patients")}
                    >
                      View All {assignedPatients.length} Patients
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No pending reviews at this time
                </p>
                <Button variant="outline" size="sm">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  View Review Queue
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <FileText className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">Create Review</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Stethoscope className="h-6 w-6 text-red-500" />
                  <span className="text-sm">Medical Assessment</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                  <span className="text-sm">Generate Report</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                  <span className="text-sm">Message Team</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Bell className="h-5 w-5 mr-2 text-purple-600" />
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">
                        Welcome to Alpha Rescue!
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Complete your profile to get started with patient
                        reviews.
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        {formatDate(new Date())}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-900">
                        Priority Review Required
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        High-priority patient case requires immediate medical
                        review.
                      </p>
                      <p className="text-xs text-amber-600 mt-2">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
