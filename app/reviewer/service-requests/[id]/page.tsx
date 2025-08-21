"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { authenticatedGet, authenticatedPatch } from "@/lib/api/auth-headers";
import { RoleHeader } from "@/components/role-header";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Loader2,
  Save,
} from "lucide-react";

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  customDescription?: string;
  priority: string;
  status: string;
  requestedDate: string;
  preferredDate?: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  caregiverNotes?: string;
  reviewerNotes?: string;
  outcome?: string;
  requiresApproval: boolean;
  patient: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  caregiver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  serviceType?: {
    id: string;
    name: string;
    description: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function ReviewerServiceRequestDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({
    status: "",
    reviewerNotes: "",
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "reviewer") {
        router.push("/");
        return;
      }
      fetchServiceRequest();
    }
  }, [user, authLoading, router, params.id]);

  const fetchServiceRequest = async () => {
    try {
      const response = await authenticatedGet(
        `/api/service-requests/${params.id}`,
        user
      );

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Not Found",
            description: "Service request not found",
            variant: "destructive",
          });
          router.push("/reviewer/service-requests");
          return;
        }
        throw new Error("Failed to fetch service request");
      }

      const data = await response.json();
      setServiceRequest(data.serviceRequest);
      setEditData({
        status: data.serviceRequest.status,
        reviewerNotes: data.serviceRequest.reviewerNotes || "",
      });
    } catch (error) {
      console.error("Error fetching service request:", error);
      toast({
        title: "Error",
        description: "Failed to load service request details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!serviceRequest) return;

    setIsUpdating(true);
    try {
      const response = await authenticatedPatch(
        `/api/service-requests/${serviceRequest.id}`,
        user,
        editData
      );

      if (!response.ok) {
        throw new Error("Failed to update service request");
      }

      toast({
        title: "Success",
        description: "Service request reviewed successfully",
      });

      // Refresh the data
      fetchServiceRequest();
    } catch (error) {
      console.error("Error updating service request:", error);
      toast({
        title: "Error",
        description: "Failed to update service request",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
      approved: {
        label: "Approved",
        variant: "default" as const,
        icon: CheckCircle,
      },
      in_progress: {
        label: "In Progress",
        variant: "default" as const,
        icon: Pause,
      },
      completed: {
        label: "Completed",
        variant: "default" as const,
        icon: CheckCircle,
      },
      cancelled: {
        label: "Cancelled",
        variant: "destructive" as const,
        icon: XCircle,
      },
      rejected: {
        label: "Rejected",
        variant: "destructive" as const,
        icon: XCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
      icon: AlertCircle,
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: "Low", variant: "secondary" as const },
      medium: { label: "Medium", variant: "default" as const },
      high: { label: "High", variant: "destructive" as const },
      urgent: { label: "Urgent", variant: "destructive" as const },
    };

    const config = priorityConfig[
      priority.toLowerCase() as keyof typeof priorityConfig
    ] || {
      label: priority,
      variant: "secondary" as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!serviceRequest) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <div className="text-muted-foreground">Service request not found</div>
      </div>
    );
  }

  return (
    <>
      <RoleHeader role="reviewer" />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{serviceRequest.title}</h1>
              <p className="text-muted-foreground">
                Request ID: {serviceRequest.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Review
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    {getStatusBadge(serviceRequest.status)}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Priority:</span>
                    {getPriorityBadge(serviceRequest.priority)}
                  </div>
                </div>

                {serviceRequest.serviceType && (
                  <div>
                    <span className="text-sm font-medium">Service Type:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {serviceRequest.serviceType.name}
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <span className="text-sm font-medium">Description:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {serviceRequest.description}
                  </p>
                </div>

                {serviceRequest.customDescription && (
                  <div>
                    <span className="text-sm font-medium">
                      Additional Details:
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {serviceRequest.customDescription}
                    </p>
                  </div>
                )}

                {serviceRequest.notes && (
                  <div>
                    <span className="text-sm font-medium">Patient Notes:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {serviceRequest.notes}
                    </p>
                  </div>
                )}

                {serviceRequest.caregiverNotes && (
                  <div>
                    <span className="text-sm font-medium">
                      Caregiver Notes:
                    </span>
                    <p className="text-sm text-muted-foreground mt-1 bg-muted p-2 rounded">
                      {serviceRequest.caregiverNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient & Caregiver Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient & Caregiver
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Patient:</span>
                    <div className="mt-1">
                      <p className="text-sm">
                        {serviceRequest.patient.user.firstName}{" "}
                        {serviceRequest.patient.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {serviceRequest.patient.user.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">
                      Assigned Caregiver:
                    </span>
                    <div className="mt-1">
                      <p className="text-sm">
                        {serviceRequest.caregiver.firstName}{" "}
                        {serviceRequest.caregiver.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {serviceRequest.caregiver.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Approval Status</Label>
                  <Select
                    value={editData.status}
                    onValueChange={(value) =>
                      setEditData({ ...editData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reviewerNotes">Review Notes</Label>
                  <Textarea
                    id="reviewerNotes"
                    value={editData.reviewerNotes}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        reviewerNotes: e.target.value,
                      })
                    }
                    placeholder="Add your review comments..."
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Requested:</span>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(serviceRequest.requestedDate)}
                  </p>
                </div>

                {serviceRequest.preferredDate && (
                  <div>
                    <span className="text-sm font-medium">Preferred:</span>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(serviceRequest.preferredDate)}
                    </p>
                  </div>
                )}

                {serviceRequest.scheduledDate && (
                  <div>
                    <span className="text-sm font-medium">Scheduled:</span>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(serviceRequest.scheduledDate)}
                    </p>
                  </div>
                )}

                {serviceRequest.completedDate && (
                  <div>
                    <span className="text-sm font-medium">Completed:</span>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(serviceRequest.completedDate)}
                    </p>
                  </div>
                )}

                {serviceRequest.approvedBy && (
                  <div>
                    <span className="text-sm font-medium">Approved By:</span>
                    <p className="text-xs text-muted-foreground">
                      {serviceRequest.approvedBy.firstName}{" "}
                      {serviceRequest.approvedBy.lastName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
