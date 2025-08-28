"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { RoleHeader } from "@/components/role-header";
import {
  authenticatedGet,
  authenticatedPatch,
  authenticatedPost,
} from "@/lib/api/auth-headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Loader2,
  CalendarPlus,
  CalendarDays,
  Check,
  Search,
  Filter,
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("requestedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isScheduling, setIsScheduling] = useState<string | null>(null);
  const [scheduleDialog, setScheduleDialog] = useState<{
    isOpen: boolean;
    request: ServiceRequest | null;
    selectedDate: Date | undefined;
    notes: string;
    isCalendarOpen: boolean;
  }>({
    isOpen: false,
    request: null,
    selectedDate: undefined,
    notes: "",
    isCalendarOpen: false,
  });
  const [completionDialog, setCompletionDialog] = useState<{
    isOpen: boolean;
    request: ServiceRequest | null;
    notes: string;
    outcome: string;
  }>({
    isOpen: false,
    request: null,
    notes: "",
    outcome: "",
  });
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "caregiver") {
        router.push("/");
        return;
      }
      fetchServiceRequests();
    }
  }, [user, authLoading, router]);

  // Handle click outside calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        scheduleDialog.isCalendarOpen
      ) {
        setScheduleDialog((prev) => ({
          ...prev,
          isCalendarOpen: false,
        }));
      }
    };

    if (scheduleDialog.isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [scheduleDialog.isCalendarOpen]);

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

  const handleScheduleRequest = (request: ServiceRequest) => {
    setScheduleDialog({
      isOpen: true,
      request,
      selectedDate: request.preferredDate
        ? new Date(request.preferredDate)
        : undefined,
      notes: "",
      isCalendarOpen: false,
    });
  };

  const handleCompleteRequest = (request: ServiceRequest) => {
    setCompletionDialog({
      isOpen: true,
      request,
      notes: "",
      outcome: "",
    });
  };

  const confirmCompletion = async () => {
    if (!completionDialog.request) return;

    try {
      const response = await authenticatedPatch(
        `/api/service-requests/${completionDialog.request.id}`,
        user,
        {
          status: "COMPLETED",
          completedDate: new Date().toISOString(),
          caregiverNotes: completionDialog.notes,
          outcome: completionDialog.outcome,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to complete service request");
      }

      toast({
        title: "Success",
        description: "Service request marked as completed",
      });

      setCompletionDialog({
        isOpen: false,
        request: null,
        notes: "",
        outcome: "",
      });

      fetchServiceRequests();
    } catch (error) {
      console.error("Error completing service request:", error);
      toast({
        title: "Error",
        description: "Failed to complete service request",
        variant: "destructive",
      });
    }
  };

  const confirmSchedule = async () => {
    if (!scheduleDialog.request || !scheduleDialog.selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date for scheduling",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(scheduleDialog.request.id);
    try {
      const response = await authenticatedPatch(
        `/api/service-requests/${scheduleDialog.request.id}`,
        user,
        {
          status: "SCHEDULED",
          scheduledDate: scheduleDialog.selectedDate.toISOString(),
          caregiverNotes: scheduleDialog.notes || undefined,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to schedule service request");
      }

      // Create corresponding caregiver schedule
      try {
        await authenticatedPost("/api/caregiver-schedules", user, {
          patientId: scheduleDialog.request.patient.id,
          scheduleType: "ROUTINE_VISIT", // Default type, can be customized
          title: scheduleDialog.request.title,
          description: scheduleDialog.request.description,
          scheduledDate: scheduleDialog.selectedDate.toISOString(),
          notes: scheduleDialog.notes || undefined,
        });
      } catch (scheduleError) {
        console.error("Failed to create caregiver schedule:", scheduleError);
        // Don't fail the whole operation if schedule creation fails
      }

      // Send notification to patient
      try {
        await authenticatedPost("/api/notifications", user, {
          userId: scheduleDialog.request.patient.user.id,
          type: "SERVICE_SCHEDULED",
          title: "Service Request Scheduled",
          message: `Your service request "${
            scheduleDialog.request.title
          }" has been scheduled for ${scheduleDialog.selectedDate.toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}.`,
          metadata: {
            serviceRequestId: scheduleDialog.request.id,
            scheduledDate: scheduleDialog.selectedDate.toISOString(),
          },
        });
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
        // Don't fail the whole operation if notification fails
      }

      toast({
        title: "Success",
        description: `Service request scheduled for ${scheduleDialog.selectedDate.toLocaleDateString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}. Patient has been notified.`,
      });

      // Close dialog and refresh data
      setScheduleDialog({
        isOpen: false,
        request: null,
        selectedDate: undefined,
        notes: "",
        isCalendarOpen: false,
      });
      fetchServiceRequests();
    } catch (error) {
      console.error("Error scheduling service request:", error);
      toast({
        title: "Error",
        description: "Failed to schedule service request",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(null);
    }
  };

  const getStatusText = (status: string) => {
    const statusConfig = {
      PENDING: { label: "Pending", className: "text-amber-600 font-medium" },
      APPROVED: { label: "Approved", className: "text-blue-600 font-medium" },
      SCHEDULED: {
        label: "Scheduled",
        className: "text-purple-600 font-medium",
      },
      IN_PROGRESS: {
        label: "In Progress",
        className: "text-orange-600 font-medium",
      },
      COMPLETED: {
        label: "Completed",
        className: "text-green-600 font-medium",
      },
      CANCELLED: { label: "Cancelled", className: "text-gray-500 font-medium" },
      REJECTED: { label: "Rejected", className: "text-red-600 font-medium" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return <span className={config.className}>{config.label}</span>;
  };

  const getPriorityText = (priority: string) => {
    const priorityConfig = {
      LOW: { label: "Low", className: "text-green-600 font-medium" },
      MEDIUM: { label: "Medium", className: "text-yellow-600 font-medium" },
      HIGH: { label: "High", className: "text-orange-600 font-medium" },
      CRITICAL: { label: "Critical", className: "text-red-600 font-medium" },
    };

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.MEDIUM;

    return <span className={config.className}>{config.label}</span>;
  };

  const getFilteredAndSortedRequests = () => {
    let filtered = serviceRequests;

    // Filter by status
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "pending":
          filtered = filtered.filter(
            (req) => req.status === "PENDING" || req.status === "APPROVED"
          );
          break;
        case "scheduled":
          filtered = filtered.filter(
            (req) => req.status === "SCHEDULED" || req.status === "IN_PROGRESS"
          );
          break;
        case "completed":
          filtered = filtered.filter((req) => req.status === "COMPLETED");
          break;
        case "cancelled":
          filtered = filtered.filter(
            (req) => req.status === "CANCELLED" || req.status === "REJECTED"
          );
          break;
      }
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (req) => req.priority === priorityFilter.toUpperCase()
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.serviceType?.name.toLowerCase().includes(query) ||
          req.patient.user.firstName.toLowerCase().includes(query) ||
          req.patient.user.lastName.toLowerCase().includes(query) ||
          req.patient.user.email.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "requestedDate":
          aValue = new Date(a.requestedDate);
          bValue = new Date(b.requestedDate);
          break;
        case "priority":
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "patient":
          aValue = `${a.patient.user.firstName} ${a.patient.user.lastName}`;
          bValue = `${b.patient.user.firstName} ${b.patient.user.lastName}`;
          break;
        case "service":
          aValue = a.serviceType?.name || "";
          bValue = b.serviceType?.name || "";
          break;
        default:
          aValue = a.requestedDate;
          bValue = b.requestedDate;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredRequests = getFilteredAndSortedRequests();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="caregiver" />
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Summary Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-8 w-8 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Skeleton className="h-10 w-80" />
                <div className="flex gap-2 flex-wrap">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-36" />
                  <Skeleton className="h-10 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="w-[180px] py-2">
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead className="w-[120px] py-2">
                      <Skeleton className="h-4 w-12" />
                    </TableHead>
                    <TableHead className="w-[90px] py-2">
                      <Skeleton className="h-4 w-12" />
                    </TableHead>
                    <TableHead className="w-[80px] py-2">
                      <Skeleton className="h-4 w-12" />
                    </TableHead>
                    <TableHead className="w-[140px] py-2">
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead className="w-[140px] py-2">
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                    <TableHead className="w-[100px] py-2 text-center">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i} className="h-12">
                      <TableCell className="py-2">
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="py-2">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="py-2">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="py-2">
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex justify-center gap-1">
                          <Skeleton className="h-7 w-7" />
                          <Skeleton className="h-7 w-7" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
            <Link href="/caregiver/schedules">
              <CalendarDays className="h-4 w-4 mr-2" />
              View Schedules
            </Link>
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {
                  serviceRequests.filter(
                    (req) =>
                      req.status === "PENDING" || req.status === "APPROVED"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {
                  serviceRequests.filter(
                    (req) =>
                      req.status === "SCHEDULED" || req.status === "IN_PROGRESS"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {
                  serviceRequests.filter((req) => req.status === "COMPLETED")
                    .length
                }
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">
                {
                  serviceRequests.filter(
                    (req) =>
                      req.status === "CANCELLED" || req.status === "REJECTED"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by service, patient name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requestedDate">
                      Date Requested
                    </SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
                {(statusFilter !== "all" ||
                  priorityFilter !== "all" ||
                  searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("all");
                      setPriorityFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Requests Table */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Service Requests</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredRequests.length} of {serviceRequests.length}{" "}
                  requests
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="w-[120px] py-2">Patient</TableHead>
                    <TableHead className="w-[180px] py-2">Service</TableHead>
                    <TableHead className="w-[90px] py-2">Status</TableHead>
                    <TableHead className="w-[80px] py-2">Priority</TableHead>
                    <TableHead className="w-[140px] py-2">Requested</TableHead>
                    <TableHead className="w-[140px] py-2">Scheduled</TableHead>
                    <TableHead className="w-[100px] py-2 text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            No Service Requests
                          </h3>
                          <p className="text-muted-foreground">
                            No service requests found matching your criteria.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        className="hover:bg-muted/50 h-12"
                      >
                        <TableCell className="py-2">
                          <div className="text-sm">
                            <div className="font-medium">
                              {request.patient.user.firstName}{" "}
                              {request.patient.user.lastName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="text-sm">
                            <div className="font-medium truncate max-w-[200px]">
                              {request.title}
                            </div>
                            {request.serviceType && (
                              <div className="text-sm text-blue-600 truncate">
                                {request.serviceType.name}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-2 text-xs">
                          {getStatusText(request.status)}
                        </TableCell>
                        <TableCell className="py-2 text-xs">
                          {getPriorityText(request.priority)}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="text-xs">
                            <div className="font-medium">
                              {new Date(
                                request.requestedDate
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-muted-foreground  relative -top-0">
                              {new Date(
                                request.requestedDate
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="text-xs">
                            {request.scheduledDate ? (
                              <>
                                <div className="font-medium">
                                  {new Date(
                                    request.scheduledDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                                <div className="text-muted-foreground">
                                  {new Date(
                                    request.scheduledDate
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </div>
                              </>
                            ) : (
                              <span className="text-muted-foreground">
                                Not scheduled
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex justify-center items-center gap-1">
                            {(request.status === "APPROVED" ||
                              request.status === "PENDING") && (
                              <Button
                                variant="link"
                                size="lg"
                                onClick={() => handleScheduleRequest(request)}
                                title="Schedule this service request"
                                className="h-7 w-auto p-2"
                              >
                                <CalendarPlus className="h-3 w-3" />
                                Schedule
                              </Button>
                            )}
                            {(request.status === "SCHEDULED" ||
                              request.status === "IN_PROGRESS") && (
                              <Button
                                variant="link"
                                size="lg"
                                onClick={() => handleCompleteRequest(request)}
                                title="Mark as completed"
                                className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                              >
                                <Check className="h-3 w-3" />
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog
        open={scheduleDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setScheduleDialog({
              isOpen: false,
              request: null,
              selectedDate: undefined,
              notes: "",
              isCalendarOpen: false,
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Schedule Service Request</DialogTitle>
            <DialogDescription>
              {scheduleDialog.request && (
                <>
                  Schedule "{scheduleDialog.request.title}" for{" "}
                  {scheduleDialog.request.patient.user.firstName}{" "}
                  {scheduleDialog.request.patient.user.lastName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Date Picker */}
            <div className="relative">
              <Label htmlFor="schedule-date">Select Date</Label>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-2",
                  !scheduleDialog.selectedDate && "text-muted-foreground"
                )}
                onClick={() =>
                  setScheduleDialog((prev) => ({
                    ...prev,
                    isCalendarOpen: !prev.isCalendarOpen,
                  }))
                }
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {scheduleDialog.selectedDate ? (
                  format(scheduleDialog.selectedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>

              {scheduleDialog.isCalendarOpen && (
                <div
                  ref={calendarRef}
                  className="absolute top-full left-0 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg"
                  style={{
                    zIndex: 99999,
                    width: "280px",
                  }}
                >
                  <Calendar
                    mode="single"
                    selected={scheduleDialog.selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setScheduleDialog((prev) => ({
                          ...prev,
                          selectedDate: date,
                          isCalendarOpen: false, // Close calendar after selection
                        }));
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isDisabled = date < today;
                      return isDisabled;
                    }}
                    initialFocus
                    numberOfMonths={1}
                    defaultMonth={scheduleDialog.selectedDate || new Date()}
                    className="border-0 text-base "
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="schedule-notes">Notes (Optional)</Label>
              <Textarea
                id="schedule-notes"
                value={scheduleDialog.notes}
                onChange={(e) =>
                  setScheduleDialog((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Add any notes about the scheduling..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setScheduleDialog({
                  isOpen: false,
                  request: null,
                  selectedDate: undefined,
                  notes: "",
                  isCalendarOpen: false,
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSchedule}
              disabled={!scheduleDialog.selectedDate || !!isScheduling}
            >
              {isScheduling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog
        open={completionDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCompletionDialog({
              isOpen: false,
              request: null,
              notes: "",
              outcome: "",
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Complete Service Request</DialogTitle>
            <DialogDescription>
              {completionDialog.request && (
                <>
                  Mark "{completionDialog.request.title}" for{" "}
                  {completionDialog.request.patient.user.firstName}{" "}
                  {completionDialog.request.patient.user.lastName} as completed
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="completion-notes">
                Completion Notes (Optional)
              </Label>
              <Textarea
                id="completion-notes"
                placeholder="Add any notes about the service completion..."
                value={completionDialog.notes}
                onChange={(e) =>
                  setCompletionDialog((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="outcome">Outcome (Optional)</Label>
              <Textarea
                id="outcome"
                placeholder="Describe the outcome or results of the service..."
                value={completionDialog.outcome}
                onChange={(e) =>
                  setCompletionDialog((prev) => ({
                    ...prev,
                    outcome: e.target.value,
                  }))
                }
                className="mt-2"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setCompletionDialog({
                  isOpen: false,
                  request: null,
                  notes: "",
                  outcome: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCompletion}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
