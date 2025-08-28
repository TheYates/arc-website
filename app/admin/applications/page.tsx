"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getApplications } from "@/lib/api/applications";
import { ApplicationData } from "@/lib/types/applications";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

// Enhanced cache for applications with TTL (30 seconds)
let applicationsCache: { data: ApplicationData[]; timestamp: number } | null = null;
const CACHE_TTL = 30 * 1000; // 30 seconds

// Helper function to check if cache is valid
const isCacheValid = (cache: { timestamp: number } | null): boolean => {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_TTL;
};

// Helper function to get cached data or fetch fresh data
const getCachedApplications = async (user: any): Promise<ApplicationData[]> => {
  if (isCacheValid(applicationsCache)) {
    console.log("📋 Using cached applications data");
    return applicationsCache!.data;
  }

  console.log("🔄 Fetching fresh applications data");
  const startTime = performance.now();
  const data = await getApplications(user);
  const endTime = performance.now();
  
  console.log(`📋 Applications data fetched in ${(endTime - startTime).toFixed(2)}ms`);
  
  // Update cache
  applicationsCache = {
    data,
    timestamp: Date.now(),
  };
  
  return data;
};

// Debounced search hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
import { Loader2, Search, Filter, Calendar, Clock, Plus } from "lucide-react";
import { AdminApplicationsMobile } from "@/components/mobile/admin-applications";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  // Use debounced search with 300ms delay for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return; // Wait for user authentication
      
      const startTime = performance.now();
      console.log("🚀 Starting optimized applications data fetch");
      
      setIsLoading(true);
      try {
        // Use cached data when available
        const data = await getCachedApplications(user);
        setApplications(data);
        
        const endTime = performance.now();
        console.log(`✅ Applications page loaded in ${(endTime - startTime).toFixed(2)}ms`);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user]); // Depend on user instead of empty array

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Memoized filtering and sorting for better performance
  const { filteredApplications, sortedApplications } = useMemo(() => {
    const startTime = performance.now();
    
    const filtered = applications.filter((app) => {
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesSearch =
        debouncedSearchTerm === "" ||
        app.firstName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        app.lastName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        app.serviceName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });

    // Sort by most recent first
    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    
    const endTime = performance.now();
    console.log(`🔍 Filtered ${applications.length} applications to ${sorted.length} in ${(endTime - startTime).toFixed(2)}ms`);
    
    return {
      filteredApplications: filtered,
      sortedApplications: sorted,
    };
  }, [applications, statusFilter, debouncedSearchTerm]);

  // Memoized event handlers for better performance
  const handleViewApplication = useCallback((id: string) => {
    router.push(`/admin/applications/${id}`);
  }, [router]);

  const formatSubmissionDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return formatDate(date);
  }, []);

  return (
    <div className="space-y-6">
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <AdminApplicationsMobile
          title="Patient Applications"
          subtitle="Review and manage client service applications"
        />
      </div>

      <div className="hidden md:flex justify-between items-center">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
            <p className="text-muted-foreground">
              Review and manage client service applications
            </p>
          </div>
        </div>
      </div>

      <Card className="hidden md:block">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle>Applications</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  className="pl-9 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sortedApplications.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-muted-foreground">No applications found</div>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Optional Features</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedApplications.map((application) => (
                    <TableRow
                      key={application.id}
                      role="link"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => handleViewApplication(application.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleViewApplication(application.id);
                        }
                      }}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {application.firstName} {application.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {application.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {application.serviceName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {application.selectedFeatures &&
                          application.selectedFeatures.length > 0 ? (
                            application.selectedFeatures.map((feature) => (
                              <Badge
                                key={feature.id}
                                variant="outline"
                                className="text-xs"
                              >
                                {feature.featureName}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              None
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatSubmissionDate(application.submittedAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewApplication(application.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
