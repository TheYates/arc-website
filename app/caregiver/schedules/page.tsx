"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { RoleHeader } from "@/components/role-header";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Plus,
  MapPin,
} from "lucide-react";
import Link from "next/link";

interface CaregiverSchedule {
  id: string;
  scheduleType: string;
  title: string;
  description?: string;
  scheduledDate: string;
  estimatedDuration?: number;
  status: string;
  priority: string;
  notes?: string;
  completionNotes?: string;
  outcome?: string;
  completedDate?: string;
  patient: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function CaregiverSchedulesPage() {
  const [schedules, setSchedules] = useState<CaregiverSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "caregiver") {
        router.push("/");
        return;
      }
      fetchSchedules();
    }
  }, [user, authLoading, router]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/caregiver-schedules", {
        headers: {
          "Content-Type": "application/json",
        },
      });

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { label: "Scheduled", variant: "default" as const, icon: Calendar },
      IN_PROGRESS: { label: "In Progress", variant: "default" as const, icon: Loader2 },
      COMPLETED: { label: "Completed", variant: "default" as const, icon: CheckCircle },
      CANCELLED: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
      RESCHEDULED: { label: "Rescheduled", variant: "secondary" as const, icon: Calendar },
      NO_SHOW: { label: "No Show", variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
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

  const filterSchedulesByStatus = (status: string) => {
    const now = new Date();
    switch (status) {
      case "upcoming":
        return schedules.filter(schedule => 
          (schedule.status === "SCHEDULED" || schedule.status === "IN_PROGRESS") &&
          new Date(schedule.scheduledDate) >= now
        );
      case "past":
        return schedules.filter(schedule => 
          new Date(schedule.scheduledDate) < now &&
          (schedule.status === "COMPLETED" || schedule.status === "CANCELLED" || schedule.status === "NO_SHOW")
        );
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.scheduledDate);
          return scheduleDate >= today && scheduleDate < tomorrow;
        });
      default:
        return schedules;
    }
  };

  const filteredSchedules = filterSchedulesByStatus(activeTab);

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
            <h1 className="text-3xl font-bold">My Schedule</h1>
            <p className="text-muted-foreground">
              Manage your patient visits and appointments
            </p>
          </div>
          <Button asChild>
            <Link href="/caregiver/schedules/new">
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">
              Today ({filterSchedulesByStatus("today").length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({filterSchedulesByStatus("upcoming").length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({filterSchedulesByStatus("past").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredSchedules.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Schedules</h3>
                    <p className="text-muted-foreground mb-4">
                      No {activeTab} schedules at the moment.
                    </p>
                    <Button asChild>
                      <Link href="/caregiver/schedules/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Schedule
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredSchedules.map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{schedule.title}</CardTitle>
                          {getStatusBadge(schedule.status)}
                          {getScheduleTypeBadge(schedule.scheduleType)}
                          {getPriorityBadge(schedule.priority)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(schedule.scheduledDate)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {schedule.patient.user.firstName} {schedule.patient.user.lastName}
                        </span>
                        <span className="text-muted-foreground">
                          ({schedule.patient.user.email})
                        </span>
                      </div>

                      {schedule.description && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Description</p>
                          <p>{schedule.description}</p>
                        </div>
                      )}

                      {schedule.estimatedDuration && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Duration: {schedule.estimatedDuration} minutes</span>
                        </div>
                      )}

                      {schedule.completionNotes && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Completion Notes</p>
                          <p className="text-sm bg-muted p-2 rounded">{schedule.completionNotes}</p>
                        </div>
                      )}

                      {schedule.outcome && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Outcome</p>
                          <p className="text-sm bg-green-50 p-2 rounded border border-green-200">
                            {schedule.outcome}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/caregiver/schedules/${schedule.id}`}>
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
    </div>
  );
}
