"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthHeader from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowLeft,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  Heart,
  Pill,
  FileText,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Edit,
  Send,
  Calendar,
  Stethoscope,
  ClipboardList,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  conditions: string[];
  careLevel: "low" | "medium" | "high" | "critical";
  status: "stable" | "improving" | "declining" | "critical";
  assignedDate: string;
  lastVisit: string;
  nextVisit: string;
  address: string;
  phone: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    oxygenSaturation: string;
    recordedDate: string;
  };
  prescriptions: number;
  pendingReviews: number;
  notes: string;
  riskFactors: string[];
  allergies: string[];
}

interface CareNote {
  id: string;
  patientId: string;
  type: "general" | "medication" | "vitals" | "behavioral" | "emergency";
  content: string;
  priority: "low" | "medium" | "high";
  createdDate: string;
  createdBy: string;
  updatedDate?: string;
}

interface VitalRecord {
  id: string;
  patientId: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  respiratoryRate: string;
  bloodGlucose?: string;
  weight?: string;
  height?: string;
  bmi?: string;
  painLevel?: string;
  recordedDate: string;
  recordedBy: string;
}

interface ReviewerRecommendation {
  id: string;
  patientId: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: "medication" | "care_plan" | "vitals" | "general" | "follow_up";
  status: "draft" | "sent" | "acknowledged" | "completed";
  createdDate: string;
  createdBy: string;
  targetCaregiver?: string;
  dueDate?: string;
}

interface Prescription {
  id: string;
  patientId: string;
  medicationName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
  instructions: string;
  indication: string;
  priority: "low" | "medium" | "high" | "urgent";
  status:
    | "draft"
    | "pending"
    | "approved"
    | "dispensed"
    | "completed"
    | "cancelled";
  prescribedBy: string;
  prescribedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  reviewerNotes?: string;
  monitoringRequired: boolean;
  costEstimate?: number;
  insuranceCovered: boolean;
}

// Mock patient data
const mockPatient: Patient = {
  id: "1",
  name: "Sarah Johnson",
  age: 67,
  gender: "Female",
  conditions: ["Hypertension", "Type 2 Diabetes", "Arthritis"],
  careLevel: "high",
  status: "stable",
  assignedDate: "2024-01-15",
  lastVisit: "2024-01-20",
  nextVisit: "2024-02-03",
  address: "123 Oak Street, Accra",
  phone: "+233 24 123 4567",
  emergencyContact: {
    name: "Michael Johnson",
    relationship: "Son",
    phone: "+233 24 765 4321",
  },
  vitals: {
    bloodPressure: "140/90",
    heartRate: "78",
    temperature: "98.6°F",
    oxygenSaturation: "97%",
    recordedDate: "2024-01-20T10:30:00Z",
  },
  prescriptions: 5,
  pendingReviews: 2,
  notes: "Patient responding well to current treatment plan",
  riskFactors: ["Family history of heart disease", "Sedentary lifestyle"],
  allergies: ["Penicillin", "Shellfish"],
};

// Mock prescriptions data
const mockPrescriptions: Prescription[] = [
  {
    id: "RX001",
    patientId: "1",
    medicationName: "Lisinopril",
    genericName: "ACE Inhibitor",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "30 days",
    quantity: 30,
    refills: 2,
    instructions: "Take with food in the morning",
    indication: "Hypertension management",
    priority: "high",
    status: "pending",
    prescribedBy: "Dr. Smith",
    prescribedDate: "2024-01-20T09:00:00Z",
    startDate: "2024-01-21",
    endDate: "2024-02-20",
    monitoringRequired: true,
    costEstimate: 25.5,
    insuranceCovered: true,
  },
  {
    id: "RX002",
    patientId: "1",
    medicationName: "Metformin",
    genericName: "Biguanide",
    dosage: "500mg",
    frequency: "Twice daily",
    duration: "30 days",
    quantity: 60,
    refills: 3,
    instructions: "Take with meals",
    indication: "Type 2 Diabetes management",
    priority: "high",
    status: "approved",
    prescribedBy: "Dr. Smith",
    prescribedDate: "2024-01-18T14:30:00Z",
    approvedBy: "Dr. Wilson",
    approvedDate: "2024-01-19T10:15:00Z",
    startDate: "2024-01-19",
    endDate: "2024-02-18",
    monitoringRequired: false,
    costEstimate: 15.75,
    insuranceCovered: true,
  },
];

export default function ReviewerPatientDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // New state for caregiver data and reviewer recommendations
  const [careNotes, setCareNotes] = useState<CareNote[]>([]);
  const [vitalRecords, setVitalRecords] = useState<VitalRecord[]>([]);
  const [reviewerRecommendations, setReviewerRecommendations] = useState<
    ReviewerRecommendation[]
  >([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isLoadingVitals, setIsLoadingVitals] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);

  // New recommendation form state
  const [showRecommendationDialog, setShowRecommendationDialog] =
    useState(false);
  const [newRecommendation, setNewRecommendation] = useState({
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    category: "general" as
      | "medication"
      | "care_plan"
      | "vitals"
      | "general"
      | "follow_up",
    targetCaregiver: "",
    dueDate: "",
  });

  // Dialog states for detailed views
  const [showPrescriptionDetailDialog, setShowPrescriptionDetailDialog] =
    useState(false);
  const [showRecommendationDetailDialog, setShowRecommendationDetailDialog] =
    useState(false);
  const [selectedRecommendationDetail, setSelectedRecommendationDetail] =
    useState<ReviewerRecommendation | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && user.role !== "reviewer") {
      router.push("/dashboard");
    }
    if (user && user.role === "reviewer") {
      loadPatientData();
    }
  }, [user, authLoading, router, patientId]);

  const loadPatientData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In real app, fetch patient by ID
    setPatient(mockPatient);
    setPrescriptions(mockPrescriptions);

    // Load caregiver notes and vitals
    loadCaregiverData();
    setIsLoading(false);
  };

  const loadCaregiverData = async () => {
    setIsLoadingNotes(true);
    setIsLoadingVitals(true);
    setIsLoadingRecommendations(true);

    // Mock caregiver notes
    const mockCareNotes: CareNote[] = [
      {
        id: "cn1",
        patientId: patientId,
        type: "general",
        content:
          "Patient is responding well to current treatment plan. Blood pressure slightly elevated but within acceptable range. Patient reports feeling more energetic today.",
        priority: "medium",
        createdDate: "2024-01-20T14:30:00Z",
        createdBy: "Nurse Sarah Johnson",
      },
      {
        id: "cn2",
        patientId: patientId,
        type: "vitals",
        content:
          "Blood pressure trending upward over the past 3 days. Recommend monitoring more frequently and consider medication adjustment.",
        priority: "high",
        createdDate: "2024-01-19T16:45:00Z",
        createdBy: "Nurse John Smith",
      },
      {
        id: "cn3",
        patientId: patientId,
        type: "medication",
        content:
          "Patient took morning medications as prescribed. No side effects reported. Reminded patient about importance of taking medications with food.",
        priority: "low",
        createdDate: "2024-01-19T09:15:00Z",
        createdBy: "Caregiver Mary Wilson",
      },
      {
        id: "cn4",
        patientId: patientId,
        type: "behavioral",
        content:
          "Patient seems more anxious today. Discussed relaxation techniques and provided emotional support. Family visit scheduled for tomorrow.",
        priority: "medium",
        createdDate: "2024-01-18T11:20:00Z",
        createdBy: "Nurse Sarah Johnson",
      },
    ];

    // Mock vital records
    const mockVitalRecords: VitalRecord[] = [
      {
        id: "vr1",
        patientId: patientId,
        bloodPressure: "142/88",
        heartRate: "76",
        temperature: "98.4",
        oxygenSaturation: "97",
        respiratoryRate: "18",
        bloodGlucose: "145",
        weight: "68.5",
        height: "165",
        bmi: "25.2",
        painLevel: "3",
        recordedDate: "2024-01-20T08:30:00Z",
        recordedBy: "Nurse Sarah Johnson",
      },
      {
        id: "vr2",
        patientId: patientId,
        bloodPressure: "138/85",
        heartRate: "78",
        temperature: "98.6",
        oxygenSaturation: "98",
        respiratoryRate: "16",
        bloodGlucose: "132",
        weight: "68.3",
        height: "165",
        bmi: "25.1",
        painLevel: "2",
        recordedDate: "2024-01-19T08:30:00Z",
        recordedBy: "Caregiver Mary Wilson",
      },
      {
        id: "vr3",
        patientId: patientId,
        bloodPressure: "145/92",
        heartRate: "82",
        temperature: "98.8",
        oxygenSaturation: "96",
        respiratoryRate: "20",
        bloodGlucose: "158",
        weight: "68.7",
        height: "165",
        bmi: "25.3",
        painLevel: "4",
        recordedDate: "2024-01-18T08:30:00Z",
        recordedBy: "Nurse John Smith",
      },
    ];

    // Mock reviewer recommendations
    const mockRecommendations: ReviewerRecommendation[] = [
      {
        id: "rr1",
        patientId: patientId,
        title: "Blood Pressure Monitoring",
        content:
          "Please monitor blood pressure twice daily and report any readings above 150/95. Consider increasing Lisinopril dosage if trend continues.",
        priority: "high",
        category: "vitals",
        status: "sent",
        createdDate: "2024-01-19T10:00:00Z",
        createdBy: "Dr. Michael Chen",
        targetCaregiver: "Nurse Sarah Johnson",
        dueDate: "2024-01-25",
      },
      {
        id: "rr2",
        patientId: patientId,
        title: "Medication Compliance Review",
        content:
          "Please ensure patient is taking medications with food as prescribed. Monitor for any gastrointestinal side effects.",
        priority: "medium",
        category: "medication",
        status: "acknowledged",
        createdDate: "2024-01-18T14:30:00Z",
        createdBy: "Dr. Michael Chen",
        targetCaregiver: "Caregiver Mary Wilson",
      },
    ];

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setCareNotes(mockCareNotes);
    setVitalRecords(mockVitalRecords);
    setReviewerRecommendations(mockRecommendations);

    setIsLoadingNotes(false);
    setIsLoadingVitals(false);
    setIsLoadingRecommendations(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-blue-100 text-blue-800";
      case "improving":
        return "bg-green-100 text-green-800";
      case "declining":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getCareLevel = (level: string) => {
    switch (level) {
      case "low":
        return { label: "Low Care", color: "bg-green-100 text-green-800" };
      case "medium":
        return { label: "Medium Care", color: "bg-yellow-100 text-yellow-800" };
      case "high":
        return { label: "High Care", color: "bg-orange-100 text-orange-800" };
      case "critical":
        return { label: "Critical Care", color: "bg-red-100 text-red-800" };
      default:
        return { label: "Unknown", color: "bg-slate-100 text-slate-800" };
    }
  };

  const getPrescriptionStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "dispensed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
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

  const handlePrescriptionReview = async (
    prescriptionId: string,
    action: "approve" | "reject",
    notes: string
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === prescriptionId
          ? {
              ...rx,
              status: action === "approve" ? "approved" : "cancelled",
              approvedBy:
                action === "approve"
                  ? user?.firstName + " " + user?.lastName
                  : undefined,
              approvedDate:
                action === "approve" ? new Date().toISOString() : undefined,
              reviewerNotes: notes,
            }
          : rx
      )
    );
    setSelectedPrescription(null);
    setReviewNotes("");
  };

  const handleCreateRecommendation = async () => {
    if (!newRecommendation.title || !newRecommendation.content) {
      alert("Please fill in all required fields");
      return;
    }

    const recommendation: ReviewerRecommendation = {
      id: `rr${Date.now()}`,
      patientId: patientId,
      title: newRecommendation.title,
      content: newRecommendation.content,
      priority: newRecommendation.priority,
      category: newRecommendation.category,
      status: "draft",
      createdDate: new Date().toISOString(),
      createdBy: user?.name || "Current Reviewer",
      targetCaregiver: newRecommendation.targetCaregiver || undefined,
      dueDate: newRecommendation.dueDate || undefined,
    };

    setReviewerRecommendations((prev) => [recommendation, ...prev]);

    // Reset form
    setNewRecommendation({
      title: "",
      content: "",
      priority: "medium",
      category: "general",
      targetCaregiver: "",
      dueDate: "",
    });

    setShowRecommendationDialog(false);
    alert("Recommendation created successfully!");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Patient Header Skeleton */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="mt-3 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="w-full">
            <div className="flex space-x-1 mb-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
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

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Patient not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const careLevel = getCareLevel(patient.careLevel);

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/reviewer/patients")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Patients</span>
          </Button>
        </div>

        {/* Patient Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-200 p-3 rounded-full">
                <User className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-slate-900">
                    {patient.name}
                  </h1>
                  <span className="text-slate-600 text-sm">
                    {patient.age} years • {patient.gender}
                  </span>
                  <Badge className={getStatusColor(patient.status)}>
                    {patient.status}
                  </Badge>
                  <Badge className={careLevel.color}>{careLevel.label}</Badge>
                </div>
                {/* Contact Information - Horizontal Layout */}
                <div className="flex items-center space-x-6 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-slate-600">
                    <Phone className="h-3 w-3" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-slate-600">
                    <MapPin className="h-3 w-3" />
                    <span>{patient.address}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex space-x-6">
                <div>
                  <p className="text-xs text-slate-600">Last Visit</p>
                  <p className="text-sm font-medium">
                    {formatDateOnly(patient.lastVisit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Next Visit</p>
                  <p className="text-sm font-medium">
                    {formatDateOnly(patient.nextVisit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="notes">Caregiver Notes</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="history">Medical History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Vitals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span>Latest Vitals</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Blood Pressure:</span>
                      <span className="font-medium">
                        {patient.vitals.bloodPressure}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Heart Rate:</span>
                      <span className="font-medium">
                        {patient.vitals.heartRate} bpm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Temperature:</span>
                      <span className="font-medium">
                        {patient.vitals.temperature}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Oxygen Saturation:</span>
                      <span className="font-medium">
                        {patient.vitals.oxygenSaturation}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-slate-500">
                        Recorded: {formatDate(patient.vitals.recordedDate)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <span>Medical Conditions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {patient.conditions.map((condition, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="mr-2 mb-2"
                        >
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Allergies & Risk Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span>Allergies & Risks</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">
                        Allergies:
                      </h4>
                      <div className="space-y-1">
                        {patient.allergies.map((allergy, index) => (
                          <Badge
                            key={index}
                            className="bg-red-100 text-red-800 mr-2"
                          >
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">
                        Risk Factors:
                      </h4>
                      <div className="space-y-1">
                        {patient.riskFactors.map((risk, index) => (
                          <Badge
                            key={index}
                            className="bg-orange-100 text-orange-800 mr-2 mb-1"
                          >
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-green-500" />
                      <span>Emergency Contact</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Name:</span>
                      <span className="font-medium">
                        {patient.emergencyContact.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Relationship:</span>
                      <span className="font-medium">
                        {patient.emergencyContact.relationship}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phone:</span>
                      <span className="font-medium">
                        {patient.emergencyContact.phone}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Prescriptions Tab */}
            <TabsContent value="prescriptions" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900">
                  Prescription Management
                </h3>
                <Badge className="bg-orange-100 text-orange-800">
                  {prescriptions.filter((p) => p.status === "pending").length}{" "}
                  Pending Reviews
                </Badge>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-3 py-2 text-left text-xs font-medium">
                            Medication
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium">
                            Dosage
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium">
                            Priority
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium">
                            Status
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium">
                            Prescribed By
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptions.map((prescription) => {
                          const prescribedDateTime = formatDateTime(
                            prescription.prescribedDate
                          );
                          return (
                            <tr
                              key={prescription.id}
                              className="hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                              onClick={() => {
                                setSelectedPrescription(prescription);
                                setShowPrescriptionDetailDialog(true);
                              }}
                            >
                              <td className="px-3 py-2">
                                <div className="font-medium text-slate-900">
                                  {prescription.medicationName}
                                </div>
                                <div className="text-xs text-slate-600">
                                  {prescription.indication}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="font-medium">
                                  {prescription.dosage}
                                </div>
                                <div className="text-xs text-slate-600">
                                  {prescription.frequency}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  className={getPriorityColor(
                                    prescription.priority
                                  )}
                                  size="sm"
                                >
                                  {prescription.priority}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  className={getPrescriptionStatusColor(
                                    prescription.status
                                  )}
                                  size="sm"
                                >
                                  {prescription.status}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-sm font-medium">
                                  {prescribedDateTime.date}
                                </div>
                                <div className="text-xs text-slate-600">
                                  by {prescription.prescribedBy}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Prescription Detail Dialog */}
              <Dialog
                open={showPrescriptionDetailDialog}
                onOpenChange={setShowPrescriptionDetailDialog}
              >
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      Prescription Details -{" "}
                      {selectedPrescription?.medicationName}
                    </DialogTitle>
                  </DialogHeader>
                  {selectedPrescription && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">
                            Medication Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong>Name:</strong>{" "}
                              {selectedPrescription.medicationName}
                            </div>
                            {selectedPrescription.genericName && (
                              <div>
                                <strong>Generic:</strong>{" "}
                                {selectedPrescription.genericName}
                              </div>
                            )}
                            <div>
                              <strong>Dosage:</strong>{" "}
                              {selectedPrescription.dosage}
                            </div>
                            <div>
                              <strong>Frequency:</strong>{" "}
                              {selectedPrescription.frequency}
                            </div>
                            <div>
                              <strong>Duration:</strong>{" "}
                              {selectedPrescription.duration}
                            </div>
                            <div>
                              <strong>Quantity:</strong>{" "}
                              {selectedPrescription.quantity}
                            </div>
                            <div>
                              <strong>Refills:</strong>{" "}
                              {selectedPrescription.refills}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">
                            Prescription Info
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong>Indication:</strong>{" "}
                              {selectedPrescription.indication}
                            </div>
                            <div>
                              <strong>Priority:</strong>
                              <Badge
                                className={getPriorityColor(
                                  selectedPrescription.priority
                                )}
                                size="sm"
                                className="ml-2"
                              >
                                {selectedPrescription.priority}
                              </Badge>
                            </div>
                            <div>
                              <strong>Status:</strong>
                              <Badge
                                className={getPrescriptionStatusColor(
                                  selectedPrescription.status
                                )}
                                size="sm"
                                className="ml-2"
                              >
                                {selectedPrescription.status}
                              </Badge>
                            </div>
                            <div>
                              <strong>Prescribed By:</strong>{" "}
                              {selectedPrescription.prescribedBy}
                            </div>
                            <div>
                              <strong>Date:</strong>{" "}
                              {
                                formatDateTime(
                                  selectedPrescription.prescribedDate
                                ).date
                              }
                            </div>
                            {selectedPrescription.monitoringRequired && (
                              <div className="mt-2">
                                <Badge className="bg-blue-100 text-blue-800">
                                  Monitoring Required
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {selectedPrescription.instructions && (
                        <div>
                          <h4 className="font-medium mb-2">Instructions</h4>
                          <p className="text-sm text-slate-700">
                            {selectedPrescription.instructions}
                          </p>
                        </div>
                      )}
                      {selectedPrescription.sideEffects && (
                        <div>
                          <h4 className="font-medium mb-2">Side Effects</h4>
                          <p className="text-sm text-slate-700">
                            {selectedPrescription.sideEffects}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {prescriptions.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No prescriptions found for this patient</p>
                </div>
              )}
            </TabsContent>

            {/* Medical History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Medical history and previous treatments will be displayed
                    here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vitals Tab */}
            <TabsContent value="vitals" className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Vital Signs History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoadingVitals ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12" />
                      ))}
                    </div>
                  ) : vitalRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-2 py-1.5 text-left text-xs font-medium">
                              Date & Time
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium">
                              Temperature
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium">
                              Blood Pressure
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium">
                              Pulse Rate
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium">
                              SpO2
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium">
                              Respiratory Rate
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium">
                              Weight
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium">
                              Height
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium">
                              Recorded By
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {vitalRecords.map((vital) => (
                            <tr key={vital.id} className="hover:bg-slate-50">
                              <td className="px-2 py-1.5 text-sm">
                                {formatDate(vital.recordedDate)}{" "}
                                {formatTime(vital.recordedDate)}
                              </td>
                              <td className="px-2 py-1.5 text-sm">
                                {vital.temperature}°F
                              </td>
                              <td className="px-2 py-1.5 text-sm">
                                {vital.bloodPressure}
                              </td>
                              <td className="px-2 py-1.5 text-sm">
                                {vital.heartRate} bpm
                              </td>
                              <td className="px-2 py-1.5 text-sm">
                                {vital.oxygenSaturation}%
                              </td>
                              <td className="px-2 py-1.5 text-sm">
                                {vital.respiratoryRate} /min
                              </td>
                              <td className="px-2 py-1.5 text-sm">
                                {vital.weight ? `${vital.weight} kg` : "-"}
                              </td>
                              <td className="px-2 py-1.5 text-sm">
                                {vital.height ? `${vital.height} cm` : "-"}
                              </td>
                              <td className="px-2 py-1.5">
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1 py-0"
                                >
                                  {vital.recordedBy}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-center py-4 text-sm">
                      No vital signs recorded yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Caregiver Notes Tab */}
            <TabsContent value="notes" className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span>Caregiver Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoadingNotes ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : careNotes.length > 0 ? (
                    <div className="space-y-2">
                      {careNotes.map((note) => (
                        <div
                          key={note.id}
                          className="border rounded-md p-3 bg-slate-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3 text-slate-500" />
                              <div className="text-xs font-medium">
                                <span>
                                  {formatDate(note.createdDate)}{" "}
                                  {formatTime(note.createdDate)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Badge
                                className={`text-xs px-1.5 py-0.5 ${
                                  note.priority === "high"
                                    ? "bg-red-100 text-red-800"
                                    : note.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {note.priority}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0.5"
                              >
                                {note.type}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 mb-2">
                            {note.content}
                          </p>
                          <div className="text-xs text-slate-500">
                            By: {note.createdBy}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 text-center py-4 text-sm">
                      No caregiver notes available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold">
                  Reviewer Recommendations
                </h3>
                <Button
                  onClick={() => setShowRecommendationDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1.5"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <ClipboardList className="h-4 w-4 text-purple-500" />
                    <span>Recommendations for Caregivers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 p-0">
                  {isLoadingRecommendations ? (
                    <div className="space-y-2 p-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12" />
                      ))}
                    </div>
                  ) : reviewerRecommendations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-3 py-2 text-left text-xs font-medium">
                              Title
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium">
                              Priority
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium">
                              Category
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium">
                              Status
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium">
                              Target
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium">
                              Created
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviewerRecommendations.map((recommendation) => (
                            <tr
                              key={recommendation.id}
                              className="hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                              onClick={() => {
                                setSelectedRecommendationDetail(recommendation);
                                setShowRecommendationDetailDialog(true);
                              }}
                            >
                              <td className="px-3 py-2">
                                <div className="font-medium text-slate-900">
                                  {recommendation.title}
                                </div>
                                <div className="text-xs text-slate-600 truncate max-w-xs">
                                  {recommendation.content}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  className={`text-xs px-1.5 py-0.5 ${
                                    recommendation.priority === "urgent"
                                      ? "bg-red-100 text-red-800"
                                      : recommendation.priority === "high"
                                      ? "bg-orange-100 text-orange-800"
                                      : recommendation.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                  size="sm"
                                >
                                  {recommendation.priority}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0.5"
                                  size="sm"
                                >
                                  {recommendation.category}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  className={`text-xs px-1.5 py-0.5 ${
                                    recommendation.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : recommendation.status === "acknowledged"
                                      ? "bg-blue-100 text-blue-800"
                                      : recommendation.status === "sent"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                  size="sm"
                                >
                                  {recommendation.status}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-sm">
                                {recommendation.targetCaregiver || "-"}
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-sm">
                                  {formatDate(recommendation.createdDate)}
                                </div>
                                <div className="text-xs text-slate-600">
                                  by {recommendation.createdBy}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-center py-4 text-sm">
                      No recommendations created yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Medical history and previous treatments will be displayed
                    here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Recommendation Dialog */}
      <Dialog
        open={showRecommendationDialog}
        onOpenChange={setShowRecommendationDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Recommendation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title *
              </label>
              <Input
                placeholder="Enter recommendation title..."
                value={newRecommendation.title}
                onChange={(e) =>
                  setNewRecommendation({
                    ...newRecommendation,
                    title: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Priority
                </label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md"
                  value={newRecommendation.priority}
                  onChange={(e) =>
                    setNewRecommendation({
                      ...newRecommendation,
                      priority: e.target.value as
                        | "low"
                        | "medium"
                        | "high"
                        | "urgent",
                    })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md"
                  value={newRecommendation.category}
                  onChange={(e) =>
                    setNewRecommendation({
                      ...newRecommendation,
                      category: e.target.value as
                        | "medication"
                        | "care_plan"
                        | "vitals"
                        | "general"
                        | "follow_up",
                    })
                  }
                >
                  <option value="general">General</option>
                  <option value="medication">Medication</option>
                  <option value="vitals">Vitals</option>
                  <option value="care_plan">Care Plan</option>
                  <option value="follow_up">Follow Up</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Target Caregiver
                </label>
                <Input
                  placeholder="Enter caregiver name (optional)..."
                  value={newRecommendation.targetCaregiver}
                  onChange={(e) =>
                    setNewRecommendation({
                      ...newRecommendation,
                      targetCaregiver: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={newRecommendation.dueDate}
                  onChange={(e) =>
                    setNewRecommendation({
                      ...newRecommendation,
                      dueDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Recommendation Content *
              </label>
              <Textarea
                placeholder="Enter your recommendation details..."
                rows={4}
                value={newRecommendation.content}
                onChange={(e) =>
                  setNewRecommendation({
                    ...newRecommendation,
                    content: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleCreateRecommendation}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Create Recommendation
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRecommendationDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recommendation Detail Dialog */}
      <Dialog
        open={showRecommendationDetailDialog}
        onOpenChange={setShowRecommendationDetailDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Recommendation Details - {selectedRecommendationDetail?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedRecommendationDetail && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Recommendation Info</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Title:</strong>{" "}
                      {selectedRecommendationDetail.title}
                    </div>
                    <div>
                      <strong>Priority:</strong>
                      <Badge
                        className={`ml-2 text-xs px-1.5 py-0.5 ${
                          selectedRecommendationDetail.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : selectedRecommendationDetail.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : selectedRecommendationDetail.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                        size="sm"
                      >
                        {selectedRecommendationDetail.priority}
                      </Badge>
                    </div>
                    <div>
                      <strong>Category:</strong>
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs px-1.5 py-0.5"
                        size="sm"
                      >
                        {selectedRecommendationDetail.category}
                      </Badge>
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <Badge
                        className={`ml-2 text-xs px-1.5 py-0.5 ${
                          selectedRecommendationDetail.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : selectedRecommendationDetail.status ===
                              "acknowledged"
                            ? "bg-blue-100 text-blue-800"
                            : selectedRecommendationDetail.status === "sent"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                        size="sm"
                      >
                        {selectedRecommendationDetail.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Assignment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Created By:</strong>{" "}
                      {selectedRecommendationDetail.createdBy}
                    </div>
                    <div>
                      <strong>Created Date:</strong>{" "}
                      {formatDate(selectedRecommendationDetail.createdDate)}{" "}
                      {formatTime(selectedRecommendationDetail.createdDate)}
                    </div>
                    {selectedRecommendationDetail.targetCaregiver && (
                      <div>
                        <strong>Target Caregiver:</strong>{" "}
                        {selectedRecommendationDetail.targetCaregiver}
                      </div>
                    )}
                    {selectedRecommendationDetail.dueDate && (
                      <div>
                        <strong>Due Date:</strong>{" "}
                        {formatDate(selectedRecommendationDetail.dueDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Content</h4>
                <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">
                  {selectedRecommendationDetail.content}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
