"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { authenticatedGet } from "@/lib/api/auth-headers";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Edit,
  X,
  RotateCcw,
  ArrowUpDown,
  CalendarDays,
} from "lucide-react";

interface CaregiverSchedule {
  id: string;
  scheduleType: string;
  title: string;
  description?: string;
  scheduledDate: string;
  status: string;
  notes?: string;
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
}

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<CaregiverSchedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<CaregiverSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [caregiverFilter, setCaregiverFilter] = useState("all");
  const [sortField, setSortField] = useState("scheduledDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        router.push("/");
        return;
      }
      fetchSchedules();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    filterAndSortSchedules();
  }, [schedules, searchTerm, statusFilter, caregiverFilter, sortField, sortDirection]);

  const fetchSchedules = async () => {
    try {
      const response = await authenticatedGet("/api/caregiver-schedules", user);

      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }

      const data = await response.json();
      setSchedules(data.schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortSchedules = () => {
    let filtered = schedules;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.patient.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.patient.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.caregiver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.caregiver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.patient.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(schedule => schedule.status === statusFilter.toUpperCase());
    }

    // Filter by caregiver
    if (caregiverFilter !== "all") {
      filtered = filtered.filter(schedule => schedule.caregiver.id === caregiverFilter);
    }

    // Sort schedules
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "scheduledDate":
          aValue = new Date(a.scheduledDate);
          bValue = new Date(b.scheduledDate);
          break;
        case "patient":
          aValue = `${a.patient.user.lastName}, ${a.patient.user.firstName}`;
          bValue = `${b.patient.user.lastName}, ${b.patient.user.firstName}`;
          break;
        case "caregiver":
          aValue = `${a.caregiver.lastName}, ${a.caregiver.firstName}`;
          bValue = `${b.caregiver.lastName}, ${b.caregiver.firstName}`;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a[sortField as keyof CaregiverSchedule];
          bValue = b[sortField as keyof CaregiverSchedule];
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredSchedules(filtered);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusText = (status: string) => {
    const statusConfig = {
      SCHEDULED: { label: "Scheduled", color: "text-blue-600" },
      IN_PROGRESS: { label: "In Progress", color: "text-orange-600" },
      COMPLETED: { label: "Completed", color: "text-green-600" },
      CANCELLED: { label: "Cancelled", color: "text-red-600" },
      RESCHEDULED: { label: "Rescheduled", color: "text-purple-600" },
      NO_SHOW: { label: "No Show", color: "text-red-600" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
    return <span className={config.color}>{config.label}</span>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get unique caregivers for filter
  const uniqueCaregivers = Array.from(
    new Set(schedules.map(schedule => schedule.caregiver.id))
  ).map(id => {
    const caregiver = schedules.find(schedule => schedule.caregiver.id === id)?.caregiver;
    return caregiver;
  }).filter(Boolean);

  // Calculate statistics
  const stats = {
    total: schedules.length,
    scheduled: schedules.filter(s => s.status === "SCHEDULED").length,
    inProgress: schedules.filter(s => s.status === "IN_PROGRESS").length,
    completed: schedules.filter(s => s.status === "COMPLETED").length,
    cancelled: schedules.filter(s => s.status === "CANCELLED").length,
  };

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
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

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Caregiver Schedules</h1>
          <p className="text-muted-foreground">
            Manage and monitor all caregiver schedules across the platform
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 text-orange-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schedules, patients, or caregivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
              <Select value={caregiverFilter} onValueChange={setCaregiverFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Caregivers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Caregivers</SelectItem>
                  {uniqueCaregivers.map((caregiver) => (
                    <SelectItem key={caregiver!.id} value={caregiver!.id}>
                      {caregiver!.firstName} {caregiver!.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schedules Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Schedules</CardTitle>
              <div className="text-sm text-muted-foreground">
                Showing {filteredSchedules.length} of {schedules.length} schedules
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-[60px] py-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("scheduledDate")}
                      className="h-auto p-0 font-semibold text-xs"
                    >
                      Date
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[180px] py-2">Service</TableHead>
                  <TableHead className="w-[120px] py-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("patient")}
                      className="h-auto p-0 font-semibold text-xs"
                    >
                      Patient
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px] py-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("caregiver")}
                      className="h-auto p-0 font-semibold text-xs"
                    >
                      Caregiver
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[90px] py-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("status")}
                      className="h-auto p-0 font-semibold text-xs"
                    >
                      Status
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px] py-2 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Schedules Found
                        </h3>
                        <p className="text-muted-foreground">
                          No schedules match your current filters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id} className="hover:bg-muted/50 h-12">
                      <TableCell className="py-2">
                        <div className="text-xs">
                          <div className="font-medium">
                            {formatDate(schedule.scheduledDate)}
                          </div>
                          <div className="text-muted-foreground">
                            {formatTime(schedule.scheduledDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-sm">
                          <div className="font-medium">{schedule.title}</div>
                          {getScheduleTypeBadge(schedule.scheduleType)}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-sm">
                          <div className="font-medium">
                            {schedule.patient.user.firstName} {schedule.patient.user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.patient.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-sm">
                          <div className="font-medium">
                            {schedule.caregiver.firstName} {schedule.caregiver.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.caregiver.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {getStatusText(schedule.status)}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex justify-center items-center gap-1">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => router.push(`/admin/schedules/${schedule.id}`)}
                            title="View details"
                            className="h-7 w-auto p-1 text-xs"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {user?.role === "super_admin" && (
                            <>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement edit functionality
                                  toast({
                                    title: "Edit Schedule",
                                    description: "Edit functionality will be implemented soon",
                                  });
                                }}
                                title="Edit schedule"
                                className="h-7 w-auto p-1 text-xs"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {schedule.status === "SCHEDULED" && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => {
                                    // TODO: Implement cancel functionality
                                    toast({
                                      title: "Cancel Schedule",
                                      description: "Cancel functionality will be implemented soon",
                                    });
                                  }}
                                  title="Cancel schedule"
                                  className="h-7 w-auto p-1 text-xs text-red-600 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                              {(schedule.status === "SCHEDULED" || schedule.status === "CANCELLED") && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => {
                                    // TODO: Implement reschedule functionality
                                    toast({
                                      title: "Reschedule",
                                      description: "Reschedule functionality will be implemented soon",
                                    });
                                  }}
                                  title="Reschedule"
                                  className="h-7 w-auto p-1 text-xs text-blue-600 hover:text-blue-700"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              )}
                            </>
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
  );
}
