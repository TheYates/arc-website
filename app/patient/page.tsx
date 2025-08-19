"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { RoleHeader } from "@/components/role-header";
import { PatientMobileDashboard } from "@/components/mobile/patient-dashboard";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  User,
  Heart,
  Shield,
  Activity,
  Stethoscope,
  MessageSquare,
  Users,
} from "lucide-react";

interface ApplicationData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  serviceName: string;
  startDate?: string;
  duration?: string;
  careNeeds?: string;
  status: string;
  paymentStatus?: string;
  submittedAt: string;
  assignedReviewer?: {
    id: string;
    name: string;
    email: string;
    assignedAt: string;
  };
  assignedCaregiver?: {
    id: string;
    name: string;
    email: string;
    assignedAt: string;
  };
}

export default function PatientDashboard() {
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Wait for auth to finish loading before making redirect decisions
    if (authLoading) return;

    if (!user || user.role !== "patient") {
      router.push("/login");
      return;
    }

    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/patient/application?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setApplication(data.application);
        } else {
          console.log("No application found or error fetching");
        }
      } catch (error) {
        console.error("Error fetching application:", error);
        toast({
          title: "Error",
          description: "Failed to load your application data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [user, authLoading, router, toast]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

 

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header Navigation */}
      <RoleHeader role="patient" />

      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <PatientMobileDashboard />
      </div>

      {/* Desktop */}
      <main className="hidden md:block container mx-auto px-4 py-6 w-full max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Good{" "}
                {new Date().getHours() < 12
                  ? "morning"
                  : new Date().getHours() < 18
                  ? "afternoon"
                  : "evening"}
                , {user?.firstName || 'Patient'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} • {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            
          </div>
        </div>

        {application ? (
          <div className="space-y-6">
            {/* Welcome Section */}


            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Your Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{application.serviceName}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted {new Date(application.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(application.status)} variant="secondary">
                        {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                      </Badge>
                    </div>

                    {application.paymentStatus !== 'completed' && (
                      <div className="p-4 border border-gray-600 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-orange-800">Payment Required</p>
                            <p className="text-sm text-orange-700">Complete payment to activate services</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => router.push('/patient/payment')}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => router.push('/patient/medical')}
                      className="h-auto p-4 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Stethoscope className="h-6 w-6" />
                      <span className="text-sm">Medical Records</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Calendar className="h-6 w-6 text-purple-600" />
                      <span className="text-sm">Appointments</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <MessageSquare className="h-6 w-6 text-green-600" />
                      <span className="text-sm">Messages</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <FileText className="h-6 w-6 text-orange-600" />
                      <span className="text-sm">Care Plan</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>
                  Your submitted application information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Name:</span>
                      <span>{application.firstName} {application.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span>{application.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Phone:</span>
                      <span>{application.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {application.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Address:</span>
                        <span>{application.address}</span>
                      </div>
                    )}
                    {application.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Duration:</span>
                        <span>{application.duration}</span>
                      </div>
                    )}
                  </div>
                </div>

                {application.careNeeds && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-sm mb-2">Care Needs:</h4>
                      <p className="text-sm text-gray-600">{application.careNeeds}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Care Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Your Care Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application ? (
                  <div className="space-y-3">
                    {/* Reviewer (Medical Professional) */}
                    {application.assignedReviewer ? (
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{application.assignedReviewer.name}</p>
                          <p className="text-sm text-muted-foreground">Medical Reviewer</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-muted-foreground">No Medical Reviewer Assigned</p>
                          <p className="text-sm text-muted-foreground">Will be assigned soon</p>
                        </div>
                      </div>
                    )}

                    {/* Caregiver */}
                    {application.assignedCaregiver ? (
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{application.assignedCaregiver.name}</p>
                          <p className="text-sm text-muted-foreground">Care Coordinator</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-muted-foreground">No Caregiver Assigned</p>
                          <p className="text-sm text-muted-foreground">Will be assigned soon</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading care team information...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* No Application Found */
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Application Found</h2>
            <p className="text-muted-foreground mb-6">
              You haven't submitted an application yet. Get started with Alpha Rescue Consult today.
            </p>
            <Button onClick={() => router.push('/services')}>
              Browse Services
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
