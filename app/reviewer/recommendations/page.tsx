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
  Pill,
  Plus,
  Eye,
  Edit,
  Send,
} from "lucide-react";

interface Recommendation {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientConditions: string[];
  recommendationType:
    | "medication"
    | "treatment"
    | "lifestyle"
    | "referral"
    | "monitoring";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "draft" | "pending" | "approved" | "implemented" | "rejected";
  createdDate: string;
  implementationDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  notes?: string;
  medications?: MedicationRecommendation[];
  followUpRequired: boolean;
  followUpDate?: string;
}

interface MedicationRecommendation {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  sideEffects?: string[];
  contraindications?: string[];
}

export default function ReviewerRecommendationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState<
    Partial<Recommendation>
  >({
    recommendationType: "medication",
    priority: "medium",
    followUpRequired: false,
    medications: [],
  });

  // Mock recommendations data
  const mockRecommendations: Recommendation[] = [
    {
      id: "rec-001",
      patientId: "5",
      patientName: "Akosua Asante",
      patientAge: 68,
      patientConditions: ["Hypertension", "Type 2 Diabetes", "Obesity"],
      recommendationType: "medication",
      title: "Hypertension Management Adjustment",
      description:
        "Based on recent elevated BP readings (180/95), recommend increasing Lisinopril dosage and adding Amlodipine for better control.",
      priority: "high",
      status: "pending",
      createdDate: "2024-01-15T10:30:00Z",
      notes:
        "Patient has been experiencing dizziness and nausea. Current medication may not be sufficient.",
      medications: [
        {
          name: "Lisinopril",
          dosage: "20mg",
          frequency: "Once daily",
          duration: "Ongoing",
          instructions: "Take in the morning with or without food",
          sideEffects: ["Dry cough", "Dizziness", "Hyperkalemia"],
          contraindications: ["Pregnancy", "Angioedema history"],
        },
        {
          name: "Amlodipine",
          dosage: "5mg",
          frequency: "Once daily",
          duration: "Ongoing",
          instructions: "Take at the same time each day",
          sideEffects: ["Ankle swelling", "Flushing", "Fatigue"],
          contraindications: ["Severe aortic stenosis"],
        },
      ],
      followUpRequired: true,
      followUpDate: "2024-01-29",
    },
    {
      id: "rec-002",
      patientId: "6",
      patientName: "Kofi Mensah",
      patientAge: 72,
      patientConditions: [
        "Type 2 Diabetes",
        "Diabetic Neuropathy",
        "Hypertension",
      ],
      recommendationType: "treatment",
      title: "Diabetic Neuropathy Pain Management",
      description:
        "Recommend starting gabapentin for neuropathic pain management and physical therapy for mobility improvement.",
      priority: "medium",
      status: "approved",
      createdDate: "2024-01-14T14:20:00Z",
      implementationDate: "2024-01-16",
      reviewedBy: "Dr. Sarah Johnson",
      reviewedDate: "2024-01-14T16:00:00Z",
      notes:
        "Patient reports significant pain in feet and hands affecting daily activities.",
      followUpRequired: true,
      followUpDate: "2024-02-14",
    },
    {
      id: "rec-003",
      patientId: "7",
      patientName: "Abena Osei",
      patientAge: 45,
      patientConditions: ["Post-surgical recovery", "Wound healing"],
      recommendationType: "monitoring",
      title: "Enhanced Wound Monitoring Protocol",
      description:
        "Implement daily wound assessment with photographic documentation and weekly culture if no improvement.",
      priority: "high",
      status: "implemented",
      createdDate: "2024-01-13T09:15:00Z",
      implementationDate: "2024-01-14",
      notes:
        "Wound showing slow healing progress. Need closer monitoring to prevent complications.",
      followUpRequired: true,
      followUpDate: "2024-01-21",
    },
    {
      id: "rec-004",
      patientId: "8",
      patientName: "Kwaku Boateng",
      patientAge: 58,
      patientConditions: ["Stroke recovery", "Mobility issues"],
      recommendationType: "referral",
      title: "Specialized Physical Therapy Referral",
      description:
        "Refer to neurological rehabilitation specialist for advanced stroke recovery therapy.",
      priority: "medium",
      status: "draft",
      createdDate: "2024-01-15T11:45:00Z",
      notes:
        "Patient showing good progress but would benefit from specialized neuro-rehabilitation.",
      followUpRequired: true,
      followUpDate: "2024-02-01",
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
      loadRecommendations();
    }
  }, [user, authLoading, router]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRecommendations(mockRecommendations);
    setIsLoading(false);
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesSearch =
      rec.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || rec.status === selectedStatus;
    const matchesType =
      selectedType === "all" || rec.recommendationType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "implemented":
        return "bg-blue-100 text-blue-800";
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "medication":
        return "bg-purple-100 text-purple-800";
      case "treatment":
        return "bg-blue-100 text-blue-800";
      case "lifestyle":
        return "bg-green-100 text-green-800";
      case "referral":
        return "bg-orange-100 text-orange-800";
      case "monitoring":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const handleCreateRecommendation = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newRec: Recommendation = {
      id: `rec-${Date.now()}`,
      patientId: "temp",
      patientName: "Selected Patient",
      patientAge: 0,
      patientConditions: [],
      createdDate: new Date().toISOString(),
      status: "draft",
      ...(newRecommendation as Recommendation),
    };

    setRecommendations((prev) => [newRec, ...prev]);
    setIsCreating(false);
    setNewRecommendation({
      recommendationType: "medication",
      priority: "medium",
      followUpRequired: false,
      medications: [],
    });
  };

  const handleStatusUpdate = async (recId: string, newStatus: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === recId
          ? {
              ...rec,
              status: newStatus as any,
              reviewedBy: user?.firstName + " " + user?.lastName,
              reviewedDate: new Date().toISOString(),
              implementationDate:
                newStatus === "implemented"
                  ? new Date().toISOString()
                  : rec.implementationDate,
            }
          : rec
      )
    );
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Medical Recommendations
            </h1>
            <p className="text-slate-600 mt-2">
              Create and manage patient care recommendations
            </p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Recommendation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Recommendation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Recommendation Type
                    </label>
                    <select
                      value={newRecommendation.recommendationType}
                      onChange={(e) =>
                        setNewRecommendation((prev) => ({
                          ...prev,
                          recommendationType: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="medication">Medication</option>
                      <option value="treatment">Treatment</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="referral">Referral</option>
                      <option value="monitoring">Monitoring</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newRecommendation.priority}
                      onChange={(e) =>
                        setNewRecommendation((prev) => ({
                          ...prev,
                          priority: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <Input
                    value={newRecommendation.title || ""}
                    onChange={(e) =>
                      setNewRecommendation((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter recommendation title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={newRecommendation.description || ""}
                    onChange={(e) =>
                      setNewRecommendation((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter detailed recommendation description"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notes
                  </label>
                  <Textarea
                    value={newRecommendation.notes || ""}
                    onChange={(e) =>
                      setNewRecommendation((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Additional notes or observations"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="followUp"
                    checked={newRecommendation.followUpRequired}
                    onChange={(e) =>
                      setNewRecommendation((prev) => ({
                        ...prev,
                        followUpRequired: e.target.checked,
                      }))
                    }
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="followUp" className="text-sm text-slate-700">
                    Follow-up required
                  </label>
                </div>
                {newRecommendation.followUpRequired && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Follow-up Date
                    </label>
                    <Input
                      type="date"
                      value={newRecommendation.followUpDate || ""}
                      onChange={(e) =>
                        setNewRecommendation((prev) => ({
                          ...prev,
                          followUpDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleCreateRecommendation}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Create Recommendation
                  </Button>
                  <Button
                    onClick={() => setIsCreating(false)}
                    variant="outline"
                    className="bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {recommendations.filter((r) => r.status === "draft").length}
                  </p>
                  <p className="text-sm text-slate-600">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {
                      recommendations.filter((r) => r.status === "pending")
                        .length
                    }
                  </p>
                  <p className="text-sm text-slate-600">Pending</p>
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
                    {
                      recommendations.filter((r) => r.status === "implemented")
                        .length
                    }
                  </p>
                  <p className="text-sm text-slate-600">Implemented</p>
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
                      recommendations.filter((r) => r.priority === "urgent")
                        .length
                    }
                  </p>
                  <p className="text-sm text-slate-600">Urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pill className="h-5 w-5" />
              <span>Recommendations Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search recommendations..."
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
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="implemented">Implemented</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Types</option>
                <option value="medication">Medication</option>
                <option value="treatment">Treatment</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="referral">Referral</option>
                <option value="monitoring">Monitoring</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecommendations.map((recommendation) => (
                  <TableRow key={recommendation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">
                          {recommendation.title}
                        </div>
                        <div className="text-sm text-slate-600 line-clamp-2">
                          {recommendation.description}
                        </div>
                        {recommendation.followUpRequired && (
                          <div className="text-xs text-teal-600 mt-1">
                            Follow-up:{" "}
                            {recommendation.followUpDate
                              ? new Date(
                                  recommendation.followUpDate
                                ).toLocaleDateString()
                              : "TBD"}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">
                          {recommendation.patientName}
                        </div>
                        <div className="text-sm text-slate-600">
                          {recommendation.patientConditions
                            .slice(0, 2)
                            .join(", ")}
                          {recommendation.patientConditions.length > 2 && "..."}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getTypeColor(
                          recommendation.recommendationType
                        )}
                      >
                        {recommendation.recommendationType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getPriorityColor(recommendation.priority)}
                      >
                        {recommendation.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(recommendation.status)}>
                        {recommendation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">
                        {new Date(
                          recommendation.createdDate
                        ).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setSelectedRecommendation(recommendation)
                              }
                              className="bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {selectedRecommendation?.title} -{" "}
                                {selectedRecommendation?.patientName}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedRecommendation && (
                              <div className="space-y-6">
                                {/* Recommendation Details */}
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                      Recommendation Details
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>ID:</strong>{" "}
                                        {selectedRecommendation.id}
                                      </p>
                                      <p>
                                        <strong>Type:</strong>{" "}
                                        <Badge
                                          className={getTypeColor(
                                            selectedRecommendation.recommendationType
                                          )}
                                        >
                                          {
                                            selectedRecommendation.recommendationType
                                          }
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Priority:</strong>{" "}
                                        <Badge
                                          className={getPriorityColor(
                                            selectedRecommendation.priority
                                          )}
                                        >
                                          {selectedRecommendation.priority}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Status:</strong>{" "}
                                        <Badge
                                          className={getStatusColor(
                                            selectedRecommendation.status
                                          )}
                                        >
                                          {selectedRecommendation.status}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Created:</strong>{" "}
                                        {new Date(
                                          selectedRecommendation.createdDate
                                        ).toLocaleString()}
                                      </p>
                                      {selectedRecommendation.implementationDate && (
                                        <p>
                                          <strong>Implemented:</strong>{" "}
                                          {new Date(
                                            selectedRecommendation.implementationDate
                                          ).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                      Patient Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>Name:</strong>{" "}
                                        {selectedRecommendation.patientName}
                                      </p>
                                      <p>
                                        <strong>Age:</strong>{" "}
                                        {selectedRecommendation.patientAge}
                                      </p>
                                      <p>
                                        <strong>Conditions:</strong>
                                      </p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedRecommendation.patientConditions.map(
                                          (condition, index) => (
                                            <Badge
                                              key={index}
                                              className="bg-slate-100 text-slate-800 text-xs"
                                            >
                                              {condition}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Description */}
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">
                                    Description
                                  </h3>
                                  <div className="bg-slate-50 p-4 rounded-lg">
                                    <p className="text-sm text-slate-700">
                                      {selectedRecommendation.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Medications */}
                                {selectedRecommendation.medications &&
                                  selectedRecommendation.medications.length >
                                    0 && (
                                    <div>
                                      <h3 className="font-semibold text-slate-900 mb-2">
                                        Medication Details
                                      </h3>
                                      <div className="space-y-4">
                                        {selectedRecommendation.medications.map(
                                          (med, index) => (
                                            <div
                                              key={index}
                                              className="border rounded-lg p-4"
                                            >
                                              <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                  <h4 className="font-medium text-slate-900">
                                                    {med.name}
                                                  </h4>
                                                  <div className="text-sm text-slate-600 space-y-1 mt-2">
                                                    <p>
                                                      <strong>Dosage:</strong>{" "}
                                                      {med.dosage}
                                                    </p>
                                                    <p>
                                                      <strong>
                                                        Frequency:
                                                      </strong>{" "}
                                                      {med.frequency}
                                                    </p>
                                                    <p>
                                                      <strong>Duration:</strong>{" "}
                                                      {med.duration}
                                                    </p>
                                                    <p>
                                                      <strong>
                                                        Instructions:
                                                      </strong>{" "}
                                                      {med.instructions}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div>
                                                  {med.sideEffects &&
                                                    med.sideEffects.length >
                                                      0 && (
                                                      <div className="mb-3">
                                                        <p className="text-sm font-medium text-slate-700">
                                                          Side Effects:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                          {med.sideEffects.map(
                                                            (effect, i) => (
                                                              <Badge
                                                                key={i}
                                                                className="bg-yellow-100 text-yellow-800 text-xs"
                                                              >
                                                                {effect}
                                                              </Badge>
                                                            )
                                                          )}
                                                        </div>
                                                      </div>
                                                    )}
                                                  {med.contraindications &&
                                                    med.contraindications
                                                      .length > 0 && (
                                                      <div>
                                                        <p className="text-sm font-medium text-slate-700">
                                                          Contraindications:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                          {med.contraindications.map(
                                                            (contra, i) => (
                                                              <Badge
                                                                key={i}
                                                                className="bg-red-100 text-red-800 text-xs"
                                                              >
                                                                {contra}
                                                              </Badge>
                                                            )
                                                          )}
                                                        </div>
                                                      </div>
                                                    )}
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Notes */}
                                {selectedRecommendation.notes && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                      Notes
                                    </h3>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <p className="text-sm text-slate-700">
                                        {selectedRecommendation.notes}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Follow-up */}
                                {selectedRecommendation.followUpRequired && (
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                      Follow-up Required
                                    </h3>
                                    <div className="bg-teal-50 p-4 rounded-lg">
                                      <p className="text-sm text-slate-700">
                                        <strong>Follow-up Date:</strong>{" "}
                                        {selectedRecommendation.followUpDate
                                          ? new Date(
                                              selectedRecommendation.followUpDate
                                            ).toLocaleDateString()
                                          : "To be determined"}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Status Actions */}
                                {selectedRecommendation.status === "draft" && (
                                  <div className="flex space-x-2 pt-4">
                                    <Button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          selectedRecommendation.id,
                                          "pending"
                                        )
                                      }
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Send className="h-4 w-4 mr-1" />
                                      Submit for Review
                                    </Button>
                                  </div>
                                )}

                                {selectedRecommendation.status ===
                                  "pending" && (
                                  <div className="flex space-x-2 pt-4">
                                    <Button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          selectedRecommendation.id,
                                          "approved"
                                        )
                                      }
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          selectedRecommendation.id,
                                          "rejected"
                                        )
                                      }
                                      variant="outline"
                                      className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                                    >
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}

                                {selectedRecommendation.status ===
                                  "approved" && (
                                  <div className="flex space-x-2 pt-4">
                                    <Button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          selectedRecommendation.id,
                                          "implemented"
                                        )
                                      }
                                      className="bg-teal-600 hover:bg-teal-700 text-white"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Mark as Implemented
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {recommendation.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
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
