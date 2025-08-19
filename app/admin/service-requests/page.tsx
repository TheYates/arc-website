"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Search,
  Filter,
  Download,
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

export default function AdminServiceRequestsPage() {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
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
    filterRequests();
  }, [serviceRequests, searchTerm, statusFilter, priorityFilter, activeTab]);

  const fetchServiceRequests = async () => {
    try {
      const response = await fetch("/api/service-requests", {
        headers: {
          "Content-Type": "application/json",
        },
      });

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

  const filterRequests = () => {
    let filtered = [...serviceRequests];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${request.patient.user.firstName} ${request.patient.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${request.caregiver.firstName} ${request.caregiver.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    // Filter by tab
    if (activeTab !== "all") {
      const now = new Date();
      switch (activeTab) {
        case "pending":
          filtered = filtered.filter(req => req.status === "PENDING");
          break;
        case "active":
          filtered = filtered.filter(req => 
            req.status === "APPROVED" || req.status === "SCHEDULED" || req.status === "IN_PROGRESS"
          );
          break;
        case "completed":
          filtered = filtered.filter(req => req.status === "COMPLETED");
          break;
        case "urgent":
          filtered = filtered.filter(req => req.priority === "HIGH" || req.priority === "CRITICAL");
          break;
      }
    }

    setFilteredRequests(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "Pending", variant: "secondary" as const, icon: Clock },
      APPROVED: { label: "Approved", variant: "default" as const, icon: CheckCircle },
      SCHEDULED: { label: "Scheduled", variant: "default" as const, icon: Calendar },
      IN_PROGRESS: { label: "In Progress", variant: "default" as const, icon: Loader2 },
      COMPLETED: { label: "Completed", variant: "default" as const, icon: CheckCircle },
      CANCELLED: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
      REJECTED: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
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

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
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

  const getTabCounts = () => {
    return {
      all: serviceRequests.length,
      pending: serviceRequests.filter(req => req.status === "PENDING").length,
      active: serviceRequests.filter(req => 
        req.status === "APPROVED" || req.status === "SCHEDULED" || req.status === "IN_PROGRESS"
      ).length,
      completed: serviceRequests.filter(req => req.status === "COMPLETED").length,
      urgent: serviceRequests.filter(req => req.priority === "HIGH" || req.priority === "CRITICAL").length,
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
            <TabsTrigger value="pending">Pending ({tabCounts.pending})</TabsTrigger>
            <TabsTrigger value="active">Active ({tabCounts.active})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({tabCounts.completed})</TabsTrigger>
            <TabsTrigger value="urgent">Urgent ({tabCounts.urgent})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Service Requests</h3>
                    <p className="text-muted-foreground">
                      No service requests match your current filters.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                          {getStatusBadge(request.status)}
                          {getPriorityBadge(request.priority)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(request.requestedDate)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Patient:</span>
                          <span>{request.patient.user.firstName} {request.patient.user.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Caregiver:</span>
                          <span>{request.caregiver.firstName} {request.caregiver.lastName}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                        <p className="text-sm">{request.description}</p>
                      </div>

                      {request.scheduledDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Scheduled: {formatDate(request.scheduledDate)}</span>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/service-requests/${request.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
  );
}
