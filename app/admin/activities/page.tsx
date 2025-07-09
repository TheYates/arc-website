"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthHeader from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth, hasPermission } from "@/lib/auth";
import {
  Activity,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";

interface SystemActivity {
  id: string;
  patientId: string;
  patientName: string;
  caregiverId: string;
  caregiverName: string;
  reviewerId?: string;
  reviewerName?: string;
  activityType: string;
  activityDate: string;
  submittedDate: string;
  reviewedDate?: string;
  status:
    | "pending"
    | "in_review"
    | "approved"
    | "requires_changes"
    | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  data: Record<string, any>;
  notes?: string;
  reviewerNotes?: string;
}

export default function AdminActivitiesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] =
    useState<SystemActivity | null>(null);

  // Mock activities data
  const mockActivities: SystemActivity[] = [
    {
      id: "ACT-001",
      patientId: "5",
      patientName: "Akosua Asante",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      reviewerId: "3",
      reviewerName: "Dr. Kwame Mensah",
      activityType: "Vital Signs",
      activityDate: "2024-01-15",
      submittedDate: "2024-01-15T14:30:00Z",
      reviewedDate: "2024-01-15T16:00:00Z",
      status: "approved",
      priority: "high",
      data: {
        bloodPressure: "140/90",
        heartRate: "78",
        temperature: "37.2°C",
        oxygenSaturation: "98%",
        weight: "65kg",
      },
      notes:
        "Patient reported feeling better today. Blood pressure slightly elevated but within acceptable range.",
      reviewerNotes:
        "Continue monitoring BP. Consider medication adjustment if trend continues.",
    },
    {
      id: "ACT-002",
      patientId: "6",
      patientName: "Kofi Mensah",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      activityType: "Medication Administration",
      activityDate: "2024-01-15",
      submittedDate: "2024-01-15T10:15:00Z",
      status: "pending",
      priority: "medium",
      data: {
        medications: [
          {
            name: "Metformin",
            dosage: "500mg",
            time: "09:00",
            administered: true,
          },
          {
            name: "Lisinopril",
            dosage: "10mg",
            time: "09:00",
            administered: true,
          },
        ],
        bloodSugar: "145 mg/dL",
      },
      notes:
        "All medications administered as prescribed. Blood sugar slightly elevated.",
    },
    {
      id: "ACT-003",
      patientId: "7",
      patientName: "Abena Osei",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      reviewerId: "3",
      reviewerName: "Dr. Kwame Mensah",
      activityType: "Physical Therapy",
      activityDate: "2024-01-14",
      submittedDate: "2024-01-14T16:45:00Z",
      reviewedDate: "2024-01-14T18:00:00Z",
      status: "approved",
      priority: "low",
      data: {
        exercises: [
          "Range of motion",
          "Strength training",
          "Balance exercises",
        ],
        duration: "45 minutes",
        patientResponse: "Good cooperation, showed improvement",
        painLevel: "3/10",
      },
      reviewerNotes: "Excellent progress. Continue current therapy plan.",
    },
    {
      id: "ACT-004",
      patientId: "8",
      patientName: "Kwaku Boateng",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      activityType: "Wound Care",
      activityDate: "2024-01-15",
      submittedDate: "2024-01-15T11:20:00Z",
      status: "requires_changes",
      priority: "urgent",
      data: {
        woundLocation: "Left leg, lower shin",
        woundSize: "3cm x 2cm",
        appearance: "Red, slightly swollen edges",
        drainage: "Minimal serous drainage",
        treatment: "Cleaned with saline, applied antibiotic ointment",
      },
      notes: "Wound appears to be healing slowly. Some redness around edges.",
      reviewerId: "3",
      reviewerName: "Dr. Kwame Mensah",
      reviewedDate: "2024-01-15T13:00:00Z",
      reviewerNotes:
        "Please photograph wound for documentation and consider culture if no improvement in 48 hours.",
    },
    {
      id: "ACT-005",
      patientId: "5",
      patientName: "Akosua Asante",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      activityType: "Mental Health Check",
      activityDate: "2024-01-14",
      submittedDate: "2024-01-14T15:30:00Z",
      status: "in_review",
      priority: "medium",
      data: {
        mood: "Improved",
        anxietyLevel: "2/10",
        sleepQuality: "Good - 7-8 hours",
        appetite: "Normal",
        socialInteraction: "Engaged with family",
      },
      notes:
        "Patient showing significant improvement in mood and anxiety levels.",
    },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && !hasPermission(user.role, "admin")) {
      router.push("/dashboard");
    }
    if (user && hasPermission(user.role, "admin")) {
      loadActivities();
    }
  }, [user, authLoading, router]);

  const loadActivities = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setActivities(mockActivities);
    setIsLoading(false);
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.caregiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.activityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || activity.status === selectedStatus;
    const matchesType =
      selectedType === "all" || activity.activityType === selectedType;
    const matchesPriority =
      selectedPriority === "all" || activity.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "requires_changes":
        return "bg-orange-100 text-orange-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
      case "in_review":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "requires_changes":
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActivityStats = () => {
    const total = activities.length;
    const pending = activities.filter((a) => a.status === "pending").length;
    const approved = activities.filter((a) => a.status === "approved").length;
    const urgent = activities.filter((a) => a.priority === "urgent").length;

    return { total, pending, approved, urgent };
  };

  const { total, pending, approved, urgent } = getActivityStats();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <div>
                      <Skeleton className="h-6 w-12 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || !hasPermission(user.role, "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access system activities.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            System Activities
          </h1>
          <p className="text-slate-600 mt-2">
            Monitor all patient care activities across the system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{total}</p>
                  <p className="text-sm text-slate-600">Total Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{pending}</p>
                  <p className="text-sm text-slate-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {approved}
                  </p>
                  <p className="text-sm text-slate-600">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{urgent}</p>
                  <p className="text-sm text-slate-600">Urgent Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>All Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="requires_changes">Requires Changes</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                <option value="Vital Signs">Vital Signs</option>
                <option value="Medication Administration">Medication</option>
                <option value="Physical Therapy">Physical Therapy</option>
                <option value="Wound Care">Wound Care</option>
                <option value="Mental Health Check">Mental Health</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Button variant="outline" className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activities Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Caregiver</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">
                          {activity.activityType}
                        </div>
                        <div className="text-sm text-slate-600">
                          {activity.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">
                        {activity.patientName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">
                        {activity.caregiverName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(activity.priority)}>
                        {activity.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(
                          activity.status
                        )} flex items-center space-x-1 w-fit`}
                      >
                        {getStatusIcon(activity.status)}
                        <span>{activity.status.replace("_", " ")}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">
                        {new Date(activity.activityDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedActivity(activity)}
                            className="bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Activity Details - {activity.activityType}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedActivity && (
                            <div className="space-y-6">
                              {/* Activity Overview */}
                              <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">
                                    Activity Information
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>ID:</strong> {selectedActivity.id}
                                    </p>
                                    <p>
                                      <strong>Type:</strong>{" "}
                                      {selectedActivity.activityType}
                                    </p>
                                    <p>
                                      <strong>Date:</strong>{" "}
                                      {new Date(
                                        selectedActivity.activityDate
                                      ).toLocaleDateString()}
                                    </p>
                                    <p>
                                      <strong>Priority:</strong>{" "}
                                      <Badge
                                        className={getPriorityColor(
                                          selectedActivity.priority
                                        )}
                                      >
                                        {selectedActivity.priority}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">
                                    Patient & Care Team
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Patient:</strong>{" "}
                                      {selectedActivity.patientName}
                                    </p>
                                    <p>
                                      <strong>Caregiver:</strong>{" "}
                                      {selectedActivity.caregiverName}
                                    </p>
                                    {selectedActivity.reviewerName && (
                                      <p>
                                        <strong>Reviewer:</strong>{" "}
                                        {selectedActivity.reviewerName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">
                                    Status & Timeline
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Status:</strong>{" "}
                                      <Badge
                                        className={getStatusColor(
                                          selectedActivity.status
                                        )}
                                      >
                                        {selectedActivity.status.replace(
                                          "_",
                                          " "
                                        )}
                                      </Badge>
                                    </p>
                                    <p>
                                      <strong>Submitted:</strong>{" "}
                                      {new Date(
                                        selectedActivity.submittedDate
                                      ).toLocaleString()}
                                    </p>
                                    {selectedActivity.reviewedDate && (
                                      <p>
                                        <strong>Reviewed:</strong>{" "}
                                        {new Date(
                                          selectedActivity.reviewedDate
                                        ).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Activity Data */}
                              <div>
                                <h3 className="font-semibold text-slate-900 mb-2">
                                  Activity Data
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                                    {JSON.stringify(
                                      selectedActivity.data,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              </div>

                              {/* Notes */}
                              {selectedActivity.notes && (
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">
                                    Caregiver Notes
                                  </h3>
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-slate-700">
                                      {selectedActivity.notes}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Reviewer Notes */}
                              {selectedActivity.reviewerNotes && (
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">
                                    Reviewer Notes
                                  </h3>
                                  <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-sm text-slate-700">
                                      {selectedActivity.reviewerNotes}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
