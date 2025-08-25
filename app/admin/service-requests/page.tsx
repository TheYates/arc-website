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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { authenticatedGet } from "@/lib/api/auth-headers";
import {
  Calendar,
  AlertCircle,
  Eye,
  Search,
  Download,
  ArrowUpDown,
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

type SortField = "Requested Date" | "Scheduled Date" | "Status" | "Priority" | "Patient" | "Caregiver";
type SortDirection = "asc" | "desc";

export default function AdminServiceRequestsPage() {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("Requested Date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        router.push("/");
        return;
      }
      fetchServiceRequests();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    filterAndSortRequests();
  }, [serviceRequests, searchTerm, statusFilter, priorityFilter, activeTab, sortField, sortDirection]);

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

  const filterAndSortRequests = () => {
    let filtered = [...serviceRequests];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${request.patient.user.firstName} ${request.patient.user.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${request.caregiver.firstName} ${request.caregiver.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (request) => request.priority === priorityFilter
      );
    }

    // Filter by tab
    if (activeTab !== "all") {
      switch (activeTab) {
        case "pending":
          filtered = filtered.filter((req) => req.status === "PENDING");
          break;
        case "active":
          filtered = filtered.filter(
            (req) =>
              req.status === "APPROVED" ||
              req.status === "SCHEDULED" ||
              req.status === "IN_PROGRESS"
          );
          break;
        case "completed":
          filtered = filtered.filter((req) => req.status === "COMPLETED");
          break;
        case "urgent":
          filtered = filtered.filter(
            (req) => req.priority === "HIGH" || req.priority === "CRITICAL"
          );
          break;
      }
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "Requested Date":
          aValue = new Date(a.requestedDate);
          bValue = new Date(b.requestedDate);
          break;
        case "Scheduled Date":
          aValue = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
          bValue = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
          break;
        case "Status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "Priority":
          const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
          break;
        case "Patient":
          aValue = `${a.patient.user.firstName} ${a.patient.user.lastName}`;
          bValue = `${b.patient.user.firstName} ${b.patient.user.lastName}`;
          break;
        case "Caregiver":
          aValue = `${a.caregiver.firstName} ${a.caregiver.lastName}`;
          bValue = `${b.caregiver.firstName} ${b.caregiver.lastName}`;
          break;
        default:
          aValue = a.requestedDate;
          bValue = b.requestedDate;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredRequests(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusText = (status: string) => {
    const statusConfig = {
      PENDING: { label: "Pending", className: "text-amber-600 font-medium" },
      APPROVED: { label: "Approved", className: "text-blue-600 font-medium" },
      SCHEDULED: { label: "Scheduled", className: "text-purple-600 font-medium" },
      IN_PROGRESS: { label: "In Progress", className: "text-orange-600 font-medium" },
      COMPLETED: { label: "Completed", className: "text-green-600 font-medium" },
      CANCELLED: { label: "Cancelled", className: "text-gray-500 font-medium" },
      REJECTED: { label: "Rejected", className: "text-red-600 font-medium" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span className={config.className}>
        {config.label}
      </span>
    );
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



  const getTabCounts = () => {
    return {
      all: serviceRequests.length,
      pending: serviceRequests.filter((req) => req.status === "PENDING").length,
      active: serviceRequests.filter(
        (req) =>
          req.status === "APPROVED" ||
          req.status === "SCHEDULED" ||
          req.status === "IN_PROGRESS"
      ).length,
      completed: serviceRequests.filter((req) => req.status === "COMPLETED")
        .length,
      urgent: serviceRequests.filter(
        (req) => req.priority === "HIGH" || req.priority === "CRITICAL"
      ).length,
    };
  };

  const tabCounts = getTabCounts();

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground">
            Access denied. Administrator role required.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Service Requests</h1>
          <p className="text-muted-foreground">
            Monitor and manage all service requests across the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, description, patient, or caregiver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({tabCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="active">Active ({tabCounts.active})</TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({tabCounts.completed})
          </TabsTrigger>
          <TabsTrigger value="urgent">Urgent ({tabCounts.urgent})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Service Requests
                  </h3>
                  <p className="text-muted-foreground">
                    No service requests match your current filters.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">
                      Service Requests ({filteredRequests.length})
                    </CardTitle>
                    <CardDescription>
                      {activeTab === "all"
                        ? "All service requests in the system"
                        : `Showing ${activeTab} service requests`}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sorted by {sortField} ({sortDirection ===  "asc" ? "Ascending" : "Descending"})
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead className="w-[140px] py-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("Requested Date")}
                          className="h-auto p-0 font-semibold text-xs"
                        >
                          Requested
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[140px] py-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("Scheduled Date")}
                          className="h-auto p-0 font-semibold text-xs"
                        >
                          Scheduled
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="py-2">Title</TableHead>
                      <TableHead className="w-[120px] py-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("Patient")}
                          className="h-auto p-0 font-semibold text-xs"
                        >
                          Patient
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[120px] py-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("Caregiver")}
                          className="h-auto p-0 font-semibold text-xs"
                        >
                          Caregiver
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[90px] py-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("Status")}
                          className="h-auto p-0 font-semibold text-xs"
                        >
                          Status
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[80px] py-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("Priority")}
                          className="h-auto p-0 font-semibold text-xs"
                        >
                          Priority
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[60px] py-2"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-muted/50 h-12">
                        <TableCell className="py-2">
                          <div className="text-xs">
                            <div className="font-medium">
                              {new Date(request.requestedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-muted-foreground">
                              {new Date(request.requestedDate).toLocaleTimeString("en-US", {
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
                                  {new Date(request.scheduledDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                                <div className="text-muted-foreground">
                                  {new Date(request.scheduledDate).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </div>
                              </>
                            ) : (
                              <span className="text-muted-foreground">Not scheduled</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="text-sm">
                            <div className="font-medium truncate max-w-[200px]">
                              {request.title}
                            </div>
                            {request.serviceType && (
                              <div className="text-xs text-blue-600 truncate">
                                {request.serviceType.name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="text-xs">
                            <div className="font-medium">
                              {request.patient.user.firstName} {request.patient.user.lastName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="text-xs">
                            <div className="font-medium">
                              {request.caregiver.firstName} {request.caregiver.lastName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-xs">
                          {getStatusText(request.status)}
                        </TableCell>
                        <TableCell className="py-2 text-xs">
                          {getPriorityText(request.priority)}
                        </TableCell>
                        <TableCell className="py-2">
                          <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0">
                            <Link href={`/admin/service-requests/${request.id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
