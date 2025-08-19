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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { RoleHeader } from "@/components/role-header";
import { authenticatedGet } from "@/lib/api/auth-headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  CalendarPlus,
} from "lucide-react";
import Link from "next/link";

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
  outcome?: string;
  patient: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  serviceType?: {
    id: string;
    name: string;
    description: string;
  };
}

export default function CaregiverServiceRequestsPage() {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "caregiver") {
        router.push("/");
        return;
      }
      fetchServiceRequests();
    }
  }, [user, authLoading, router]);

  const fetchServiceRequests = async () => {
    try {
      const response = await authenticatedGet("/api/service-requests", user);

      if (!response.ok) {
        throw new Error("Failed to fetch service requests");
      }

      const data = await response.json();
      setServiceRequests(data.serviceRequests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      toast({
        title: "Error",
        description: "Failed to load service requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "Pending", variant: "secondary" as const, icon: Clock },
      APPROVED: {
        label: "Approved",
        variant: "default" as const,
        icon: CheckCircle,
      },
      SCHEDULED: {
        label: "Scheduled",
        variant: "default" as const,
        icon: Calendar,
      },
      IN_PROGRESS: {
        label: "In Progress",
        variant: "default" as const,
        icon: Loader2,
      },
      COMPLETED: {
        label: "Completed",
        variant: "default" as const,
        icon: CheckCircle,
      },
      CANCELLED: {
        label: "Cancelled",
        variant: "destructive" as const,
        icon: XCircle,
      },
      REJECTED: {
        label: "Rejected",
        variant: "destructive" as const,
        icon: XCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
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
      LOW: { label: "Low", className: "bg-green-100 text-green-800" },
      MEDIUM: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
      HIGH: { label: "High", className: "bg-orange-100 text-orange-800" },
      CRITICAL: { label: "Critical", className: "bg-red-100 text-red-800" },
    };

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.MEDIUM;

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterRequestsByStatus = (status: string) => {
    switch (status) {
      case "pending":
        return serviceRequests.filter(
          (req) => req.status === "PENDING" || req.status === "APPROVED"
        );
      case "scheduled":
        return serviceRequests.filter(
          (req) => req.status === "SCHEDULED" || req.status === "IN_PROGRESS"
        );
      case "completed":
        return serviceRequests.filter((req) => req.status === "COMPLETED");
      case "cancelled":
        return serviceRequests.filter(
          (req) => req.status === "CANCELLED" || req.status === "REJECTED"
        );
      default:
        return serviceRequests;
    }
  };

  const filteredRequests = filterRequestsByStatus(activeTab);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="caregiver" />
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "caregiver") {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="caregiver" />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
      <RoleHeader role="caregiver" />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Service Requests</h1>
            <p className="text-muted-foreground">
              Manage service requests from your assigned patients
            </p>
          </div>
          <Button asChild>
            <Link href="/caregiver/schedules/new">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Create Schedule
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending (
              {
                serviceRequests.filter(
                  (req) => req.status === "PENDING" || req.status === "APPROVED"
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled (
              {
                serviceRequests.filter(
                  (req) =>
                    req.status === "SCHEDULED" || req.status === "IN_PROGRESS"
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed (
              {
                serviceRequests.filter((req) => req.status === "COMPLETED")
                  .length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled (
              {
                serviceRequests.filter(
                  (req) =>
                    req.status === "CANCELLED" || req.status === "REJECTED"
                ).length
              }
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Preferred Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            No Service Requests
                          </h3>
                          <p className="text-muted-foreground">
                            No {activeTab} service requests at the moment.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {request.description}
                            </div>
                            {request.customDescription && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {request.customDescription}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.patient.user.firstName}{" "}
                              {request.patient.user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.patient.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {getPriorityBadge(request.priority)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(request.requestedDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {request.preferredDate
                              ? formatDate(request.preferredDate)
                              : "Not specified"}
                          </div>
                          {request.scheduledDate && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Scheduled: {formatDate(request.scheduledDate)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/caregiver/service-requests/${request.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {(request.status === "APPROVED" ||
                              request.status === "PENDING") && (
                              <Button size="sm" asChild>
                                <Link
                                  href={`/caregiver/service-requests/${request.id}/schedule`}
                                >
                                  <CalendarPlus className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
