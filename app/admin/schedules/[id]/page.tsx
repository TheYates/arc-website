"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { authenticatedGet } from "@/lib/api/auth-headers";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  X,
  RotateCcw,
  MapPin,
  Phone,
  Mail,
  FileText,
  Activity,
} from "lucide-react";

interface CaregiverSchedule {
  id: string;
  scheduleType: string;
  title: string;
  description?: string;
  scheduledDate: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      address?: string;
    };
  };
  caregiver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function AdminScheduleDetailPage() {
  const [schedule, setSchedule] = useState<CaregiverSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = Array.isArray((params as any)?.id) ? (params as any).id[0] : (params as any)?.id;

  useEffect(() => {
    if (!authLoading && user && id) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        router.push("/");
        return;
      }
      fetchSchedule();
    }
  }, [user, authLoading, router, id]);

  const fetchSchedule = async () => {
    try {
      const response = await authenticatedGet(`/api/caregiver-schedules/${id}` as string, user);

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Schedule Not Found",
            description: "The requested schedule could not be found.",
            variant: "destructive",
          });
          router.push("/admin/schedules");
          return;
        }
        throw new Error("Failed to fetch schedule");
      }

      const data = await response.json();
      setSchedule(data.schedule);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast({
        title: "Error",
        description: "Failed to load schedule details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
      IN_PROGRESS: { label: "In Progress", className: "bg-yellow-100 text-yellow-800" },
      COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800" },
      CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
      RESCHEDULED: { label: "Rescheduled", className: "bg-purple-100 text-purple-800" },
      NO_SHOW: { label: "No Show", className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getScheduleTypeBadge = (type: string) => {
    const typeConfig = {
      ROUTINE_VISIT: { label: "Routine", className: "bg-blue-100 text-blue-800" },
      EMERGENCY_VISIT: { label: "Emergency", className: "bg-red-100 text-red-800" },
      FOLLOW_UP: { label: "Follow-up", className: "bg-green-100 text-green-800" },
      ASSESSMENT: { label: "Assessment", className: "bg-purple-100 text-purple-800" },
      MEDICATION: { label: "Medication", className: "bg-orange-100 text-orange-800" },
      THERAPY: { label: "Therapy", className: "bg-teal-100 text-teal-800" },
      CONSULTATION: { label: "Consultation", className: "bg-indigo-100 text-indigo-800" },
      OTHER: { label: "Other", className: "bg-gray-100 text-gray-800" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.OTHER;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <div className="text-muted-foreground">
          Access denied. Admin role required.
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <div className="text-muted-foreground">
          Schedule not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/schedules")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schedules
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{schedule.title}</h1>
              <p className="text-muted-foreground">
                Schedule Details • {formatDateTime(schedule.scheduledDate)}
              </p>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(schedule.status)}
              {getScheduleTypeBadge(schedule.scheduleType)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {user?.role === "super_admin" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement edit functionality
                toast({
                  title: "Edit Schedule",
                  description: "Edit functionality will be implemented soon",
                });
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Schedule
            </Button>
            {schedule.status === "SCHEDULED" && (
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Implement cancel functionality
                  toast({
                    title: "Cancel Schedule",
                    description: "Cancel functionality will be implemented soon",
                  });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Schedule
              </Button>
            )}
            {(schedule.status === "SCHEDULED" || schedule.status === "CANCELLED") && (
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Implement reschedule functionality
                  toast({
                    title: "Reschedule",
                    description: "Reschedule functionality will be implemented soon",
                  });
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                <p className="font-medium">{formatDateTime(schedule.scheduledDate)}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(schedule.status)}</div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Schedule Type</p>
                <div className="mt-1">{getScheduleTypeBadge(schedule.scheduleType)}</div>
              </div>

              {schedule.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="mt-1">{schedule.description}</p>
                </div>
              )}

              {schedule.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="mt-1">{schedule.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient & Caregiver Information */}
          <div className="space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {schedule.patient.user.firstName} {schedule.patient.user.lastName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{schedule.patient.user.email}</span>
                </div>

                {schedule.patient.user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{schedule.patient.user.phone}</span>
                  </div>
                )}

                {schedule.patient.user.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{schedule.patient.user.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Caregiver Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Caregiver Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {schedule.caregiver.firstName} {schedule.caregiver.lastName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{schedule.caregiver.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDateTime(schedule.createdAt)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{formatDateTime(schedule.updatedAt)}</p>
                </div>

                {schedule.approvedBy && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                    <p className="text-sm">
                      {schedule.approvedBy.firstName} {schedule.approvedBy.lastName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
