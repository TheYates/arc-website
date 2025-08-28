"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getJobPositions,
  getJobCategories,
  getCareerApplications,
} from "@/lib/api/careers";
import type {
  JobPosition,
  CareerApplication,
  JobStatus,
} from "@/lib/types/careers";
import { formatDate } from "@/lib/utils";
import { Search, Briefcase, Tag } from "lucide-react";
import { Plus, Settings } from "lucide-react";
import { Edit } from "lucide-react";

interface AdminCareersMobileProps {
  onOpenCreate?: () => void;
  onOpenCategories?: () => void;
  onEdit?: (job: JobPosition) => void;
  title?: string;
  subtitle?: string;
}

// Enhanced cache with TTL (30 seconds) - shared with main page
let jobsCacheMobile: { data: JobPosition[]; timestamp: number } | null = null;
let categoriesCacheMobile: { data: string[]; timestamp: number } | null = null;
let applicationsCacheMobile: { data: CareerApplication[]; timestamp: number } | null = null;
const CACHE_TTL = 30 * 1000; // 30 seconds

// Helper function to check if cache is valid
const isCacheValid = (cache: { timestamp: number } | null): boolean => {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_TTL;
};

export function AdminCareersMobile({
  onOpenCreate,
  onOpenCategories,
  onEdit,
  title = "Job Management",
  subtitle = "Manage job positions and review applications",
}: AdminCareersMobileProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [jobCategory, setJobCategory] = useState<string>("all");
  const [appQuery, setAppQuery] = useState("");
  const [appStatus, setAppStatus] = useState<string>("all");

  // Debounced search for better performance
  const [debouncedAppQuery, setDebouncedAppQuery] = useState("");
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAppQuery(appQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [appQuery]);

  useEffect(() => {
    if (!user) return; // Wait for user to be available

    (async () => {
      setLoading(true);
      try {
        console.log("📱 Mobile: Starting optimized careers data fetch");
        const startTime = performance.now();
        
        // Use cached data when available
        const [jobsData, categoriesData, applicationsData] = await Promise.all([
          (async () => {
            if (isCacheValid(jobsCacheMobile)) {
              console.log("📱 Mobile: Using cached jobs data");
              return jobsCacheMobile!.data;
            }
            const data = await getJobPositions(user);
            jobsCacheMobile = { data, timestamp: Date.now() };
            return data;
          })(),
          (async () => {
            if (isCacheValid(categoriesCacheMobile)) {
              console.log("📱 Mobile: Using cached categories data");
              return categoriesCacheMobile!.data;
            }
            const data = await getJobCategories(user);
            categoriesCacheMobile = { data, timestamp: Date.now() };
            return data;
          })(),
          (async () => {
            if (isCacheValid(applicationsCacheMobile)) {
              console.log("📱 Mobile: Using cached applications data");
              return applicationsCacheMobile!.data;
            }
            const data = await getCareerApplications(user);
            applicationsCacheMobile = { data, timestamp: Date.now() };
            return data;
          })()
        ]);
        
        setJobs(jobsData || []);
        setCategories(categoriesData || []);
        setApplications(applicationsData || []);
        
        const endTime = performance.now();
        console.log(`📱 Mobile careers data loaded in ${(endTime - startTime).toFixed(2)}ms`);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const jobList = useMemo(() => {
    return jobs.filter(
      (j) => jobCategory === "all" || j.category === jobCategory
    );
  }, [jobs, jobCategory]);

  const appList = useMemo(() => {
    const term = debouncedAppQuery.trim().toLowerCase();
    return applications.filter((a) => {
      const statusOk = appStatus === "all" || a.status === appStatus;
      const textOk =
        term === "" ||
        [a.firstName, a.lastName, a.email, a.positionTitle]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(term));
      return statusOk && textOk;
    });
  }, [applications, debouncedAppQuery, appStatus]);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      reviewing: "bg-blue-100 text-blue-800",
      interview: "bg-purple-100 text-purple-800",
      hired: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={map[s] || ""}>{s}</Badge>;
  };

  const jobStatusBadge = (s: JobStatus) => {
    if (s === "published")
      return <Badge className="bg-green-100 text-green-800">Published</Badge>;
    if (s === "archived") return <Badge variant="outline">Archived</Badge>;
    return <Badge variant="secondary">Draft</Badge>;
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            className="h-8 w-8"
            aria-label="Create draft"
            onClick={onOpenCreate}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            aria-label="Manage categories"
            onClick={onOpenCategories}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="space-y-3">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-3">
          <div className="flex gap-2">
            <Select value={jobCategory} onValueChange={setJobCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              Loading...
            </div>
          ) : jobList.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No jobs
            </div>
          ) : (
            <div className="space-y-2">
              {jobList.map((j) => (
                <Card
                  key={j.id}
                  className="active:scale-[0.99] transition-transform"
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium mb-1">{j.title}</div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {j.type || "—"}
                          </span>
                          <span className="flex items-center">
                            📍{j.location || "—"}
                          </span>

                          <Badge variant="outline" className="text-[10px]">
                            <Tag className="h-3 w-3 mr-1" />
                            {j.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {jobStatusBadge(j.status)}
                        {onEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            aria-label="Edit job"
                            onClick={() => onEdit(j)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {j.description && (
                      <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {j.description}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications"
                className="pl-8"
                value={appQuery}
                onChange={(e) => setAppQuery(e.target.value)}
              />
            </div>
            <Select value={appStatus} onValueChange={setAppStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              Loading...
            </div>
          ) : appList.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No applications
            </div>
          ) : (
            <div className="space-y-2">
              {appList.map((a) => (
                <Card
                  key={a.id}
                  className="active:scale-[0.99] transition-transform"
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {a.firstName} {a.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {a.positionTitle || "General Application"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatDate(new Date(a.submittedAt))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(a.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/careers/${a.id}`)}
                      >
                        View
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
