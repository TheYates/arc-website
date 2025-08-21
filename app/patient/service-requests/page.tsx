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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { RoleHeader } from "@/components/role-header";
import { ServiceRequestDialog } from "@/components/service-request-dialog";
import { authenticatedGet } from "@/lib/api/auth-headers";
import {
  Plus,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
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
}

export default function PatientServiceRequestsPage() {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "patient") {
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="patient" />
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="patient" />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="text-muted-foreground">
              Access denied. Patient role required.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleHeader role="patient" />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Service Requests</h1>
            <p className="text-muted-foreground">
              Request services from your assigned caregiver
            </p>
          </div>
          <ServiceRequestDialog onSuccess={fetchServiceRequests} />
        </div>

        {/* Service Requests List */}
        {serviceRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Service Requests
                </h3>
                <p className="text-muted-foreground mb-4">
                  You haven't made any service requests yet.
                </p>
                <ServiceRequestDialog
                  onSuccess={fetchServiceRequests}
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Request
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Caregiver</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{request.title}</div>
                        {request.serviceType && (
                          <div className="text-xs text-muted-foreground">
                            {request.serviceType.name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm">
                        {request.description}
                      </div>
                      {request.customDescription && (
                        <div className="text-xs text-muted-foreground truncate">
                          {request.customDescription}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell className="text-sm">
                      {request.caregiver.firstName} {request.caregiver.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(request.requestedDate)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/patient/service-requests/${request.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
