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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import {
  FileText,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Eye,
  MessageSquare,
} from "lucide-react";

interface ActivityReview {
  id: string;
  patientId: string;
  patientName: string;
  caregiverId: string;
  caregiverName: string;
  activityType: string;
  activityDate: string;
  submittedDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  status:
    | "pending"
    | "in_review"
    | "approved"
    | "requires_changes"
    | "rejected";
  data: Record<string, any>;
  notes?: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedDate?: string;
}

export default function ReviewerActivitiesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityReview[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityReview | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // Mock activities data
  const mockActivities: ActivityReview[] = [
    {
      id: "act-001",
      patientId: "5",
      patientName: "Akosua Asante",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      activityType: "Vital Signs",
      activityDate: "2024-01-15",
      submittedDate: "2024-01-15T14:30:00Z",
      priority: "urgent",
      status: "pending",
      data: {
        bloodPressure: "180/95",
        heartRate: "95",
        temperature: "38.2°C",
        oxygenSaturation: "96%",
        notes:
          "Patient reported feeling dizzy and nauseous. BP elevated from previous readings.",
      },
      notes:
        "Patient showing signs of hypertensive crisis. Immediate medical attention may be required.",
    },
    {
      id: "act-002",
      patientId: "6",
      patientName: "Kofi Mensah",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      activityType: "Medication Administration",
      activityDate: "2024-01-15",
      submittedDate: "2024-01-15T10:15:00Z",
      priority: "medium",
      status: "pending",
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
          {
            name: "Insulin",
            dosage: "15 units",
            time: "09:30",
            administered: true,
          },
        ],
        bloodSugar: "145 mg/dL",
        notes:
          "All medications administered as prescribed. Blood sugar slightly elevated.",
      },
    },
    {
      id: "act-003",
      patientId: "7",
      patientName: "Abena Osei",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      activityType: "Physical Therapy",
      activityDate: "2024-01-14",
      submittedDate: "2024-01-14T16:45:00Z",
      priority: "low",
      status: "approved",
      data: {
        exercises: [
          "Range of motion",
          "Strength training",
          "Balance exercises",
        ],
        duration: "45 minutes",
        patientResponse: "Good cooperation, showed improvement in balance",
        painLevel: "3/10",
      },
      reviewerNotes: "Excellent progress. Continue current therapy plan.",
      reviewedBy: "Dr. Kwame Mensah",
      reviewedDate: "2024-01-14T18:00:00Z",
    },
    {
      id: "act-004",
      patientId: "8",
      patientName: "Kwaku Boateng",
      caregiverId: "4",
      caregiverName: "Ama Osei",
      activityType: "Wound Care",
      activityDate: "2024-01-15",
      submittedDate: "2024-01-15T11:20:00Z",
      priority: "high",
      status: "requires_changes",
      data: {
        woundLocation: "Left leg, lower shin",
        woundSize: "3cm x 2cm",
        appearance: "Red, slightly swollen edges",
        drainage: "Minimal serous drainage",
        treatment:
          "Cleaned with saline, applied antibiotic ointment, dressed with gauze",
      },
      notes: "Wound appears to be healing slowly. Some redness around edges.",
      reviewerNotes:
        "Please photograph wound for documentation and consider culture if no improvement in 48 hours.",
      reviewedBy: "Dr. Kwame Mensah",
      reviewedDate: "2024-01-15T13:00:00Z",
    },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && user.role !== "reviewer") {
      router.push("/dashboard");
    }
    if (user && user.role === "reviewer") {
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
      activity.activityType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || activity.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || activity.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleReview = async (
    activityId: string,
    status: string,
    notes: string
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              status: status as any,
              reviewerNotes: notes,
              reviewedBy: user?.firstName + " " + user?.lastName,
              reviewedDate: new Date().toISOString(),
            }
          : activity
      )
    );

    setSelectedActivity(null);
    setReviewNotes("");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
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
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <Skeleton className="flex-1 h-10" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-slate-200 p-4">
                <div className="grid grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-slate-200 p-4">
                  <div className="grid grid-cols-6 gap-4">
                    {[...Array(6)].map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "reviewer") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page.
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
            Activity Reviews
          </h1>
          <p className="text-slate-600 mt-2">
            Review and approve patient care activities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {activities.filter((a) => a.status === "pending").length}
                  </p>
                  <p className="text-sm text-slate-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {
                      activities.filter(
                        (a) => a.priority === "urgent" && a.status === "pending"
                      ).length
                    }
                  </p>
                  <p className="text-sm text-slate-600">Urgent Cases</p>
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
                    {activities.filter((a) => a.status === "approved").length}
                  </p>
                  <p className="text-sm text-slate-600">Approved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {activities.length}
                  </p>
                  <p className="text-sm text-slate-600">Total Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Activity Reviews</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
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
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="pending">Pending Review</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="requires_changes">Requires Changes</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Status</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
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
                  <TableHead>Submitted</TableHead>
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
                          {new Date(activity.activityDate).toLocaleDateString()}
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
                      <Badge
                        className={`${getPriorityColor(
                          activity.priority
                        )} flex items-center space-x-1 w-fit`}
                      >
                        {getPriorityIcon(activity.priority)}
                        <span>{activity.priority}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">
                        {new Date(activity.submittedDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(activity.submittedDate).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedActivity(activity)}
                              className="bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Review: {activity.activityType} -{" "}
                                {activity.patientName}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedActivity && (
                              <div className="space-y-6">
                                {/* Activity Details */}
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                      Activity Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
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
                                        <strong>Patient:</strong>{" "}
                                        {selectedActivity.patientName}
                                      </p>
                                      <p>
                                        <strong>Caregiver:</strong>{" "}
                                        {selectedActivity.caregiverName}
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
                                      Submission Details
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Submitted:</strong>{" "}
                                        {new Date(
                                          selectedActivity.submittedDate
                                        ).toLocaleString()}
                                      </p>
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
                                      {selectedActivity.reviewedBy && (
                                        <>
                                          <p>
                                            <strong>Reviewed by:</strong>{" "}
                                            {selectedActivity.reviewedBy}
                                          </p>
                                          <p>
                                            <strong>Reviewed:</strong>{" "}
                                            {new Date(
                                              selectedActivity.reviewedDate!
                                            ).toLocaleString()}
                                          </p>
                                        </>
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

                                {/* Previous Review Notes */}
                                {selectedActivity.reviewerNotes && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                      Previous Review Notes
                                    </h3>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                      <p className="text-sm text-slate-700">
                                        {selectedActivity.reviewerNotes}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Review Actions */}
                                {selectedActivity.status === "pending" && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                      Review Notes
                                    </h3>
                                    <Textarea
                                      placeholder="Add your review notes..."
                                      value={reviewNotes}
                                      onChange={(e) =>
                                        setReviewNotes(e.target.value)
                                      }
                                      rows={3}
                                    />
                                    <div className="flex space-x-2 mt-4">
                                      <Button
                                        onClick={() =>
                                          handleReview(
                                            selectedActivity.id,
                                            "approved",
                                            reviewNotes
                                          )
                                        }
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleReview(
                                            selectedActivity.id,
                                            "requires_changes",
                                            reviewNotes
                                          )
                                        }
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                      >
                                        <MessageSquare className="h-4 w-4 mr-1" />
                                        Request Changes
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleReview(
                                            selectedActivity.id,
                                            "rejected",
                                            reviewNotes
                                          )
                                        }
                                        variant="outline"
                                        className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                                      >
                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
