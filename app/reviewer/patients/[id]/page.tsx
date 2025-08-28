"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getPatientByIdClient } from "@/lib/api/client";
import {
  getMedicationsClient,
  getMedicationAdministrationsClient,
} from "@/lib/api/client";
import { getVitalSigns } from "@/lib/api/vitals";
import {
  getMedicalReviews,
  createMedicalReview,
} from "@/lib/api/medical-reviews-client";
import { getCareNotes } from "@/lib/api/care-notes-client";
import { Patient } from "@/lib/types/patients";
import { Medication, MedicationAdministration } from "@/lib/types/medications";
import { VitalSigns } from "@/lib/types/vitals";
import { MedicalReview } from "@/lib/types/medical-reviews";
import { CareNote } from "@/lib/types/care-notes";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Stethoscope,
  Pill,
  Activity,
  FileText,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  ArrowLeft,
  User,
  Heart,
  Trash2,
  Search,
  Edit,
} from "lucide-react";
import { RoleHeader } from "@/components/role-header";
import { ReviewerPatientMobile } from "@/components/mobile/reviewer-patient-detail";
import { useToast } from "@/hooks/use-toast";

import { PrescriptionDialog } from "@/components/medical/prescription-dialog";
import { PatientSymptomReportForm } from "@/components/medical/patient-symptom-report-form";
import {
  CareNotesForm,
  CareNotesHistory,
} from "@/components/medical/care-notes-form";
import { PatientEditForm } from "@/components/patient/patient-edit-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReviewerPatientDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMedicalDataLoading, setIsMedicalDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Medical data states
  const [medications, setMedications] = useState<Medication[]>([]);
  const [administrations, setAdministrations] = useState<
    MedicationAdministration[]
  >([]);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [medicalReviews, setMedicalReviews] = useState<MedicalReview[]>([]);
  const [caregiverNotes, setCaregiverNotes] = useState<CareNote[]>([]);
  const [reviewerNotes, setReviewerNotes] = useState<CareNote[]>([]);

  // UI states
  const [showPrescribeDialog, setShowPrescribeDialog] = useState(false);

  // Prescription states
  const [selectedMedication, setSelectedMedication] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
  const [medicationSearchOpen, setMedicationSearchOpen] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(true);
  const [showEnterReview, setShowEnterReview] = useState(true);
  const [showReviewerNoteForm, setShowReviewerNoteForm] = useState(false);
  const [showCaregiverNoteHistory, setShowCaregiverNoteHistory] =
    useState(false);
  const [showPatientEditForm, setShowPatientEditForm] = useState(false);

  // Common medications list
  const [commonMedications, setCommonMedications] = useState<string[]>([]);

  // Load common medications from database
  useEffect(() => {
    const loadCommonMedications = async () => {
      try {
        const response = await fetch('/api/medications/catalog?commonOnly=true&limit=50');
        const result = await response.json();
        if (result.success) {
          setCommonMedications(result.data.map((med: any) => med.name));
        }
      } catch (error) {
        console.error('Error loading common medications:', error);
        // Fallback to hardcoded list if API fails
        setCommonMedications([
          "Lisinopril", "Metformin", "Amlodipine", "Metoprolol", "Omeprazole",
          "Simvastatin", "Losartan", "Albuterol", "Gabapentin", "Sertraline",
          "Ibuprofen", "Acetaminophen", "Aspirin", "Hydrochlorothiazide", "Atorvastatin"
        ]);
      }
    };

    loadCommonMedications();
  }, []);

  // Memoize the transform function to prevent recreation on every render
  const transformMedicalReviews = useCallback((reviewsData: any[]) => {
    return reviewsData.map((review) => ({
      id: review.id,
      patientId: review.patientId,
      reviewerId: review.reviewerId || review.createdById,
      reviewerName: review.reviewer
        ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
        : "Unknown",
      type: review.reviewType.toLowerCase() as any,
      title: review.title,
      findings: review.findings || "",
      assessment: review.description,
      recommendations: review.recommendations || "",
      treatmentPlan: "",
      followUpRequired: review.followUpRequired,
      followUpDate: review.followUpDate,
      priority: review.priority.toLowerCase() as any,
      status: review.status.toLowerCase() as any,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      reviewedDate: review.createdAt,
      isConfidential: false,
    }));
  }, []);

  // Memoize the patient data fetching function
  const fetchPatientData = useCallback(async () => {
    const startTime = performance.now();
    console.log(
      "🚀 Starting reviewer patient data fetch for ID:",
      resolvedParams.id
    );

    try {
      // Fetch patient data first (needed for header) - this shows immediately
      const patientStart = performance.now();
      const patientData = await getPatientByIdClient(resolvedParams.id, user);
      const patientEnd = performance.now();
      console.log(
        `👤 Patient data fetched in ${(patientEnd - patientStart).toFixed(2)}ms`
      );

      setPatient(patientData);
      setIsLoading(false); // Show patient info immediately

      if (patientData) {
        // Fetch medical data in background
        fetchMedicalData(resolvedParams.id, startTime);
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [resolvedParams.id, toast]);

  // Memoize the medical data fetching function
  const fetchMedicalData = useCallback(
    async (patientId: string, startTime: number) => {
      try {
        // Fetch all medical data in parallel for better performance
        const parallelStart = performance.now();
        console.log("📊 Starting parallel reviewer medical data fetch...");

        const [
          medicationsData,
          administrationsData,
          vitalsData,
          reviewsData,
          caregiverNotesData,
          reviewerNotesData,
        ] = await Promise.all([
          getMedicationsClient(patientId, user),
          getMedicationAdministrationsClient(patientId, user),
          Promise.resolve(getVitalSigns(patientId)), // Wrap sync function
          getMedicalReviews(patientId),
          getCareNotes(patientId, "caregiver"),
          getCareNotes(patientId, "reviewer"),
        ]);

        const parallelEnd = performance.now();
        console.log(
          `📊 All parallel medical data fetched in ${(
            parallelEnd - parallelStart
          ).toFixed(2)}ms`
        );

        // Transform medical reviews data
        const transformStart = performance.now();
        const transformedReviews = transformMedicalReviews(reviewsData);
        const transformEnd = performance.now();
        console.log(
          `🔄 Data transformation took ${(
            transformEnd - transformStart
          ).toFixed(2)}ms`
        );

        // Set all data at once to minimize re-renders
        setMedications(medicationsData);
        setAdministrations(administrationsData);
        setVitals(vitalsData);
        setMedicalReviews(transformedReviews);
        setCaregiverNotes(caregiverNotesData);
        setReviewerNotes(reviewerNotesData);

        const totalEnd = performance.now();
        console.log(
          `✅ Total reviewer page load time: ${(totalEnd - startTime).toFixed(
            2
          )}ms`
        );
      } catch (error) {
        console.error("Error fetching medical data:", error);
        toast({
          title: "Warning",
          description: "Some medical data failed to load",
          variant: "destructive",
        });
      } finally {
        setIsMedicalDataLoading(false);
      }
    },
    [transformMedicalReviews, toast]
  );

  useEffect(() => {
    // Wait for auth to finish loading before making redirect decisions
    if (authLoading) return;

    if (!user || (user.role !== "reviewer" && user.role !== "super_admin")) {
      router.push("/login");
      return;
    }

    fetchPatientData();
  }, [user, router, fetchPatientData, authLoading]);

  // Memoized computed values for better performance
  const activeMedications = useMemo(() => {
    return medications.filter((med) => med.isActive);
  }, [medications]);

  const recentVitals = useMemo(() => {
    return vitals.slice(0, 5); // Show only recent 5 vitals
  }, [vitals]);

  const recentReviews = useMemo(() => {
    return medicalReviews.slice(0, 3); // Show only recent 3 reviews
  }, [medicalReviews]);

  const handleMedicationSaved = useCallback(async () => {
    const updatedMedications = await getMedicationsClient(resolvedParams.id);
    setMedications(updatedMedications);
    toast({
      title: "Success",
      description: "Medication prescribed successfully",
    });
  }, [resolvedParams.id, toast]);

  const handleReviewSaved = async () => {
    const updatedReviews = await getMedicalReviews(resolvedParams.id);
    const transformedReviews = updatedReviews.map((review) => ({
      id: review.id,
      patientId: review.patientId,
      reviewerId: review.reviewerId || review.createdById,
      reviewerName: review.reviewer
        ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
        : "Unknown",
      type: review.reviewType.toLowerCase() as any,
      title: review.title,
      findings: review.findings || "",
      assessment: review.description,
      recommendations: review.recommendations || "",
      treatmentPlan: "",
      followUpRequired: review.followUpRequired,
      followUpDate: review.followUpDate,
      priority: review.priority.toLowerCase() as any,
      status: review.status.toLowerCase() as any,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      reviewedDate: review.createdAt,
      isConfidential: false,
    }));
    setMedicalReviews(transformedReviews);
    setShowEnterReview(false); // Switch to history view after saving
    toast({
      title: "Success",
      description: "Medical review created successfully",
    });
  };

  const handleReviewerNoteSaved = useCallback(async () => {
    try {
      const updatedNotes = await getCareNotes(resolvedParams.id, "reviewer");
      setReviewerNotes(updatedNotes);
      setShowReviewerNoteForm(false);
    } catch (error) {
      console.error("Error refreshing reviewer notes:", error);
    }
  }, [resolvedParams.id]);

  const handleCaregiverNotesRefresh = useCallback(async () => {
    try {
      const updatedNotes = await getCareNotes(resolvedParams.id, "caregiver");
      setCaregiverNotes(updatedNotes);
    } catch (error) {
      console.error("Error refreshing caregiver notes:", error);
    }
  }, [resolvedParams.id]);

  // Memoized helper function to get the latest administration for a medication
  const getLatestAdministration = useCallback(
    (medicationId: string) => {
      const medicationAdministrations = administrations.filter(
        (admin) => admin.medicationId === medicationId
      );
      if (medicationAdministrations.length === 0) return null;

      return medicationAdministrations.sort(
        (a, b) =>
          new Date(b.actualTime || b.scheduledTime).getTime() -
          new Date(a.actualTime || a.scheduledTime).getTime()
      )[0];
    },
    [administrations]
  );

  // Helper function to get administration status badge
  const getAdministrationStatusBadge = (status: string) => {
    const statusColors = {
      administered: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      missed: "bg-red-100 text-red-800",
      refused: "bg-orange-100 text-orange-800",
      partial: "bg-blue-100 text-blue-800",
      delayed: "bg-purple-100 text-purple-800",
      cancelled: "bg-muted text-muted-foreground",
    };

    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-muted text-muted-foreground"
    );
  };

  // Helper function to get administration status icon
  const getAdministrationStatusIcon = (status: string) => {
    switch (status) {
      case "administered":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "missed":
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case "refused":
        return <X className="h-3 w-3 text-orange-600" />;
      case "partial":
        return <Activity className="h-3 w-3 text-blue-600" />;
      case "delayed":
        return <Clock className="h-3 w-3 text-purple-600" />;
      case "cancelled":
        return <X className="h-3 w-3 text-muted-foreground" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  // Helper functions for prescription management
  const addMedicationToPrescription = (medicationName: string) => {
    const newItem = {
      id: Date.now().toString(),
      medicationName,
      dosage: "",
      frequency: "once_daily",
      duration: "7",
      route: "oral",
      quantity: "0",
      instructions: "",
    };
    setPrescriptionItems((prev) => [...prev, newItem]);
    setSelectedMedication("");
    setMedicationSearchOpen(false);
  };

  const updatePrescriptionItem = (id: string, field: string, value: string) => {
    setPrescriptionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removePrescriptionItem = (id: string) => {
    setPrescriptionItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearPrescription = () => {
    setPrescriptionItems([]);
  };

  const savePrescriptions = async () => {
    if (prescriptionItems.length === 0) {
      toast({
        title: "No medications to save",
        description: "Please add at least one medication to the prescription.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save each prescription item to the database
      const savedMedications: Medication[] = [];
      
      for (const item of prescriptionItems) {
        const medicationData = {
          patientId: resolvedParams.id,
          prescribedBy: user?.id || 'unknown',
          medicationName: item.medicationName,
          dosage: item.dosage || "As prescribed",
          frequency: item.frequency,
          route: item.route,
          startDate: new Date().toISOString(),
          endDate: item.duration
            ? new Date(
                Date.now() + parseInt(item.duration) * 24 * 60 * 60 * 1000
              ).toISOString()
            : undefined,
          instructions:
            item.instructions ||
            `Take ${item.dosage || "as prescribed"} ${item.frequency.replace(
              "_",
              " "
            )}`,
          priority: "medium",
          category: "other"
        };

        const response = await fetch('/api/medications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(medicationData),
        });

        const result = await response.json();
        
        if (result.success) {
          savedMedications.push(result.data);
        } else {
          throw new Error(result.error || 'Failed to save medication');
        }
      }

      // Add new medications to the existing list
      setMedications((prev) => [...prev, ...savedMedications]);

      toast({
        title: "Prescriptions saved successfully",
        description: `${prescriptionItems.length} medication(s) have been prescribed for ${patient?.firstName} ${patient?.lastName}.`,
      });

      // Clear the prescription items after successful save
      setPrescriptionItems([]);
      
      // Reload medications from database to ensure consistency
      const medicationsResponse = await fetch(`/api/patients/${resolvedParams.id}/medications`);
      if (medicationsResponse.ok) {
        const medicationsResult = await medicationsResponse.json();
        if (medicationsResult.success) {
          setMedications(medicationsResult.data);
        }
      }

      // Switch to current medications view to show the newly added medications
      setShowAddPrescription(false);
      
    } catch (error) {
      console.error("Error saving prescriptions:", error);
      toast({
        title: "Error saving prescriptions",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Show loading while auth is loading or data is loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Patient Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The patient you're looking for doesn't exist or you don't have
              access to view them.
            </p>
            <Button onClick={() => router.push("/reviewer/patients")}>
              Back to My Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header Navigation */}
      <RoleHeader role="reviewer" />
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <ReviewerPatientMobile patientId={resolvedParams.id} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/reviewer/patients")}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Patients</span>
          </Button>
        </div>

        {/* Patient Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-purple-100 text-purple-600 text-xl">
                {patient.firstName?.charAt(0)}
                {patient.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                {patient.firstName} {patient.lastName}
              </h1>

              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline" className="capitalize">
                  {patient.careLevel || "Standard"} Care
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 capitalize">
                  {patient.status || "Active"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Assessment Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className=" p-3 rounded-lg bg-card">
              <p className="text-lg font-bold text-card-foreground">
                {patient.dateOfBirth
                  ? Math.floor(
                      (new Date().getTime() -
                        new Date(patient.dateOfBirth).getTime()) /
                        (1000 * 60 * 60 * 24 * 365.25)
                    )
                  : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">Age (Years)</p>
            </div>
            <div className=" p-3 rounded-lg bg-card">
              <p className="text-lg font-bold text-card-foreground">{patient.bloodType || "N/A"}</p>
              <p className="text-xs text-muted-foreground">Blood Type</p>
            </div>
            <div className=" p-3 rounded-lg bg-card">
              <p className="text-lg font-bold text-card-foreground">{patient.gender || "N/A"}</p>
              <p className="text-xs text-muted-foreground">Gender</p>
            </div>
            <div className=" p-3 rounded-lg bg-card">
              <p className="text-lg font-bold text-card-foreground">
                {patient.heightCm && patient.weightKg
                  ? `${patient.heightCm}cm / ${patient.weightKg}kg`
                  : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">Height / Weight</p>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="reviewer-notes">Reviewer Notes</TabsTrigger>
            <TabsTrigger value="caregiver-notes">Caregiver Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Vitals Recorded
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vitals.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {vitals.length > 0
                      ? `Last recorded ${formatDate(vitals[0].recordedAt)}`
                      : "No vitals recorded"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Medications
                  </CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isMedicalDataLoading ? (
                    <div className="space-y-2">
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {(medications || []).filter((m) => m.isActive).length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(medications || []).filter((m) => m.isActive).length >
                        0
                          ? "Currently prescribed"
                          : "No active medications"}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Medical Reviews
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isMedicalDataLoading ? (
                    <div className="space-y-2">
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-28"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {medicalReviews.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {medicalReviews.length > 0
                          ? `Last review ${formatDate(
                              medicalReviews[0].createdAt
                            )}`
                          : "No reviews yet"}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Patient Information
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={() => setShowPatientEditForm(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{patient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{patient.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p>{patient.address || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date of Birth
                    </p>
                    <p>{patient.dateOfBirth || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="capitalize">
                      {patient.gender || "Not specified"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Care Team */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Care Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Caregiver
                    </p>
                    {patient.assignedCaregiver ? (
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-teal-600" />
                        <span>{patient.assignedCaregiver.name}</span>
                      </div>
                    ) : (
                      <Badge variant="outline">No caregiver assigned</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Medical Reviewer
                    </p>
                    {patient.assignedReviewer ? (
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4 text-purple-600" />
                        <span>{patient.assignedReviewer.name}</span>
                      </div>
                    ) : (
                      <Badge variant="outline">No reviewer assigned</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Type</p>
                    <p className="font-medium">
                      {patient.bloodType || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Height / Weight
                    </p>
                    <p className="font-medium">
                      {patient.heightCm && patient.weightKg
                        ? `${patient.heightCm} cm / ${patient.weightKg} kg`
                        : "Not recorded"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Allergies</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(patient as any).allergies &&
                      (patient as any).allergies.length > 0 ? (
                        (patient as any).allergies.map(
                          (allergy: string, index: number) => (
                            <Badge
                              key={index}
                              variant="destructive"
                              className="text-xs"
                            >
                              {allergy}
                            </Badge>
                          )
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No known allergies
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Emergency Contact
                    </p>
                    <p className="font-medium text-sm">
                      {patient.emergencyContactName || "Not provided"}
                      {patient.emergencyContactPhone && (
                        <span className="block text-xs text-muted-foreground">
                          {patient.emergencyContactPhone}
                        </span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Section */}
            
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Vital Signs</h2>
              <span className="text-sm text-muted-foreground">
                Read-only view • Recorded by caregivers
              </span>
            </div>

            {/* Vitals Table - Excel-like format */}
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs Records</CardTitle>
              </CardHeader>
              <CardContent>
                {vitals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Date/Time</th>
                          <th className="text-left py-2 px-2">BP (mmHg)</th>
                          <th className="text-left py-2 px-2">HR (BPM)</th>
                          <th className="text-left py-2 px-2">Temp (°C)</th>
                          <th className="text-left py-2 px-2">O2 Sat (%)</th>
                          <th className="text-left py-2 px-2">Weight (kg)</th>
                          <th className="text-left py-2 px-2">Blood Sugar</th>
                          <th className="text-left py-2 px-2">Recorded By</th>
                          <th className="text-left py-2 px-2">Notes</th>
                          <th className="text-left py-2 px-2">Alerts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vitals.map((vital) => (
                          <tr
                            key={vital.id}
                            className="border-b hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-2">
                              <div>
                                <div className="text-sm font-medium">
                                  {formatDate(new Date(vital.recordedAt))}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(
                                    vital.recordedAt
                                  ).toLocaleTimeString()}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              {vital.bloodPressure
                                ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}`
                                : "-"}
                            </td>
                            <td className="py-3 px-2">
                              {vital.heartRate || "-"}
                            </td>
                            <td className="py-3 px-2">
                              {vital.temperature || "-"}
                            </td>
                            <td className="py-3 px-2">
                              {vital.oxygenSaturation || "-"}
                            </td>
                            <td className="py-3 px-2">{vital.weight || "-"}</td>
                            <td className="py-3 px-2">
                              {vital.bloodSugar || "-"}
                            </td>
                            <td className="py-3 px-2">
                              <span className="text-sm text-muted-foreground">
                                Caregiver
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className="text-xs text-muted-foreground">
                                {vital.notes || "-"}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              {vital.isAlerted && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Alert
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No vital signs recorded yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vitals will appear here when recorded by caregivers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-6">
            {/* Add Prescription Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {showAddPrescription
                        ? "Add Prescription"
                        : "Current Medications"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {showAddPrescription
                        ? "Search and add medications"
                        : "View and manage current medications"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddPrescription(!showAddPrescription)}
                  >
                    {showAddPrescription ? "View Current" : "Add New"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showAddPrescription ? (
                  <>
                    {/* Medication Search - Compact */}
                    <div className="flex items-center space-x-4">
                      <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search medications..."
                          value={selectedMedication}
                          onChange={(e) => {
                            setSelectedMedication(e.target.value);
                            setMedicationSearchOpen(e.target.value.length > 0);
                          }}
                          onFocus={() => {
                            if (selectedMedication.length > 0) {
                              setMedicationSearchOpen(true);
                            }
                          }}
                          className="pl-10 bg-background text-foreground border-border"
                        />
                        {medicationSearchOpen &&
                          selectedMedication.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                              {commonMedications
                                .filter((med) =>
                                  med
                                    .toLowerCase()
                                    .includes(selectedMedication.toLowerCase())
                                )
                                .slice(0, 10)
                                .map((medication) => (
                                  <div
                                    key={medication}
                                    className="px-3 py-2 cursor-pointer hover:bg-muted/50 text-sm transition-colors"
                                    onClick={() =>
                                      addMedicationToPrescription(medication)
                                    }
                                  >
                                    {medication}
                                  </div>
                                ))}
                              
                              {/* Show "Add New" option if no exact match found */}
                              {selectedMedication.trim() && 
                               !commonMedications.some(med => 
                                 med.toLowerCase() === selectedMedication.toLowerCase()
                               ) && (
                                <div
                                  className="px-3 py-2 cursor-pointer hover:bg-muted/50 text-sm transition-colors border-t border-border bg-accent/50"
                                  onClick={() => addMedicationToPrescription(selectedMedication.trim())}
                                >
                                  <div className="flex items-center">
                                    <Plus className="h-3 w-3 mr-2 text-green-600" />
                                    <span>Add "<strong>{selectedMedication.trim()}</strong>" (new medication)</span>
                                  </div>
                                </div>
                              )}
                              
                              {(commonMedications || []).filter((med) =>
                                med
                                  .toLowerCase()
                                  .includes(selectedMedication.toLowerCase())
                              ).length === 0 && !selectedMedication.trim() && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  Type to search medications...
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Prescription Items Table */}
                    {prescriptionItems.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Prescription Details
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-1 px-1 text-xs font-medium text-muted-foreground">
                                  Medication
                                </th>
                                <th className="text-left py-1 px-1 text-xs font-medium text-muted-foreground">
                                  Dosage
                                </th>
                                <th className="text-left py-1 px-1 text-xs font-medium text-muted-foreground">
                                  Frequency
                                </th>
                                <th className="text-left py-1 px-1 text-xs font-medium text-muted-foreground">
                                  Duration
                                </th>
                                <th className="text-left py-1 px-1 text-xs font-medium text-muted-foreground">
                                  Route
                                </th>
                                <th className="text-left py-1 px-1 text-xs font-medium text-muted-foreground">
                                  Qty
                                </th>
                                <th className="text-center py-1 px-1 text-xs font-medium text-muted-foreground">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {prescriptionItems.map((item) => (
                                <tr key={item.id} className="border-b">
                                  <td className="py-2 px-1">
                                    <div className="font-medium text-sm">
                                      {item.medicationName}
                                    </div>
                                  </td>
                                  <td className="py-2 px-1">
                                    <Input
                                      placeholder="e.g., 1 tablet"
                                      value={item.dosage}
                                      onChange={(e) =>
                                        updatePrescriptionItem(
                                          item.id,
                                          "dosage",
                                          e.target.value
                                        )
                                      }
                                      className="w-28 h-8 text-sm"
                                    />
                                  </td>
                                  <td className="py-2 px-1">
                                    <Select
                                      value={item.frequency}
                                      onValueChange={(value) =>
                                        updatePrescriptionItem(
                                          item.id,
                                          "frequency",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="w-32 h-8 text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="once_daily">
                                          Once daily
                                        </SelectItem>
                                        <SelectItem value="twice_daily">
                                          Twice daily
                                        </SelectItem>
                                        <SelectItem value="three_times_daily">
                                          Three times daily
                                        </SelectItem>
                                        <SelectItem value="four_times_daily">
                                          Four times daily
                                        </SelectItem>
                                        <SelectItem value="as_needed">
                                          As needed
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="py-2 px-1">
                                    <div className="flex items-center space-x-1">
                                      <Input
                                        type="number"
                                        value={item.duration}
                                        onChange={(e) =>
                                          updatePrescriptionItem(
                                            item.id,
                                            "duration",
                                            e.target.value
                                          )
                                        }
                                        className="w-14 h-8 text-sm"
                                      />
                                      <span className="text-xs text-muted-foreground">
                                        days
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2">
                                    <Select
                                      value={item.route}
                                      onValueChange={(value) =>
                                        updatePrescriptionItem(
                                          item.id,
                                          "route",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="w-24">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="oral">
                                          Oral
                                        </SelectItem>
                                        <SelectItem value="injection_im">
                                          IM
                                        </SelectItem>
                                        <SelectItem value="injection_iv">
                                          IV
                                        </SelectItem>
                                        <SelectItem value="topical">
                                          Topical
                                        </SelectItem>
                                        <SelectItem value="inhalation">
                                          Inhaled
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="py-3 px-2">
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) =>
                                        updatePrescriptionItem(
                                          item.id,
                                          "quantity",
                                          e.target.value
                                        )
                                      }
                                      className="w-16"
                                    />
                                  </td>
                                  <td className="py-3 px-2 text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        removePrescriptionItem(item.id)
                                      }
                                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* General Instructions */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            General Instructions
                          </label>
                          <Textarea
                            placeholder="Enter any general instructions for this prescription"
                            className="min-h-[80px]"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Total Items: {prescriptionItems.length}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={clearPrescription}
                            >
                              Clear
                            </Button>
                            <Button
                              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors"
                              onClick={savePrescriptions}
                            >
                              Save Prescriptions
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Current Medications View */
                  <div className="space-y-4">
                    {isMedicalDataLoading ? (
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Medication</th>
                                <th className="text-left py-2">Dosage</th>
                                <th className="text-left py-2">Route</th>
                                <th className="text-left py-2">Frequency</th>
                                <th className="text-left py-2">Start Date</th>
                                <th className="text-left py-2">
                                  Last Administration
                                </th>
                                <th className="text-left py-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {medications
                                .filter((m) => m.isActive)
                                .map((medication) => {
                                  const latestAdmin = getLatestAdministration(
                                    medication.id
                                  );
                                  return (
                                    <tr
                                      key={medication.id}
                                      className="border-b"
                                    >
                                      <td className="py-3">
                                        <div>
                                          <p className="font-medium">
                                            {medication.medicationName}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {medication.instructions}
                                          </p>
                                        </div>
                                      </td>
                                      <td className="py-3">
                                        {medication.dosage}
                                      </td>
                                      <td className="py-3 capitalize">
                                        {medication.route.replace("_", " ")}
                                      </td>
                                      <td className="py-3 capitalize">
                                        {medication.frequency.replace("_", " ")}
                                      </td>
                                      <td className="py-3">
                                        {formatDate(
                                          new Date(medication.startDate)
                                        )}
                                      </td>
                                      <td className="py-3">
                                        {latestAdmin ? (
                                          <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                              {getAdministrationStatusIcon(
                                                latestAdmin.status
                                              )}
                                              <Badge
                                                className={getAdministrationStatusBadge(
                                                  latestAdmin.status
                                                )}
                                              >
                                                {latestAdmin.status}
                                              </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                              {latestAdmin.actualTime
                                                ? formatDate(
                                                    new Date(
                                                      latestAdmin.actualTime
                                                    )
                                                  )
                                                : `Scheduled: ${formatDate(
                                                    new Date(
                                                      latestAdmin.scheduledTime
                                                    )
                                                  )}`}
                                            </p>
                                            {latestAdmin.dosageGiven && (
                                              <p className="text-xs text-muted-foreground">
                                                Dose: {latestAdmin.dosageGiven}
                                              </p>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-sm text-muted-foreground">
                                            No administrations recorded
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-3">
                                        <Badge className="bg-green-100 text-green-800">
                                          Active
                                        </Badge>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                        {(medications || []).filter((m) => m.isActive)
                          .length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No active medications found
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviewer Notes Tab */}
          <TabsContent value="reviewer-notes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {showReviewerNoteForm
                        ? "Create Reviewer Note"
                        : "Reviewer Notes History"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {showReviewerNoteForm
                        ? "Create a new note for this patient"
                        : "View previous reviewer notes"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setShowReviewerNoteForm(!showReviewerNoteForm)
                    }
                  >
                    {showReviewerNoteForm ? "View History" : "Create Note"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showReviewerNoteForm ? (
                  <CareNotesForm
                    patientId={resolvedParams.id}
                    patientName={`${patient.firstName} ${patient.lastName}`}
                    authorId={user?.id || ""}
                    authorName={`${user?.firstName} ${user?.lastName}`}
                    authorRole="reviewer"
                    onSave={handleReviewerNoteSaved}
                    onCancel={() => setShowReviewerNoteForm(false)}
                  />
                ) : (
                  <CareNotesHistory
                    notes={reviewerNotes}
                    currentUserRole="reviewer"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Caregiver Notes Tab (Read-only for Reviewers) */}
          <TabsContent value="caregiver-notes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Caregiver Notes</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      View notes created by caregivers (read-only)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCaregiverNotesRefresh}
                  >
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CareNotesHistory
                  notes={caregiverNotes}
                  currentUserRole="reviewer"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Prescription Dialog */}
      {patient && (
        <PrescriptionDialog
          open={showPrescribeDialog}
          onOpenChange={setShowPrescribeDialog}
          patientId={resolvedParams.id}
          patientName={`${patient.firstName} ${patient.lastName}`}
          prescribedBy={user?.id || ""}
          onSave={handleMedicationSaved}
        />
      )}

      {/* Patient Edit Form */}
      {patient && (
        <PatientEditForm
          patient={patient}
          isOpen={showPatientEditForm}
          onClose={() => setShowPatientEditForm(false)}
          onSuccess={(updatedPatient: Patient) => {
            setPatient(updatedPatient);
            setShowPatientEditForm(false);
          }}
          userRole="reviewer"
        />
      )}
    </div>
  );
}

// Create Medical Review Form Component
function CreateMedicalReviewForm({
  patientId,
  reviewerId,
  reviewerName,
  onSave,
  onCancel,
}: {
  patientId: string;
  reviewerId: string;
  reviewerName: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    type: "routine" as any,
    title: "",
    findings: "",
    assessment: "",
    recommendations: "",
    treatmentPlan: "",
    followUpRequired: false,
    followUpDate: "",
    priority: "medium" as any,
    reviewedDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMedicalReview({
        patientId,
        reviewerId,
        createdById: reviewerId,
        reviewType: formData.type.toUpperCase() as any,
        priority: formData.priority.toUpperCase() as any,
        title: formData.title,
        description:
          formData.assessment || formData.findings || "Medical review",
        findings: formData.findings,
        recommendations: formData.recommendations,
        followUpRequired: formData.followUpRequired,
        followUpDate: formData.followUpDate || undefined,
      });

      onSave();
    } catch (error) {
      console.error("Error creating medical review:", error);
      // You might want to show an error toast here
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Review Type</label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value as any }))
            }
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="follow_up">Follow-up</option>
            <option value="consultation">Consultation</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                priority: e.target.value as any,
              }))
            }
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full p-2 border rounded-md"
          placeholder="Brief title for this review"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Review Date</label>
        <input
          type="date"
          value={formData.reviewedDate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, reviewedDate: e.target.value }))
          }
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Clinical Findings
        </label>
        <textarea
          value={formData.findings}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, findings: e.target.value }))
          }
          className="w-full p-2 border rounded-md h-24"
          placeholder="Document clinical observations, vital signs review, physical examination results..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Assessment</label>
        <textarea
          value={formData.assessment}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, assessment: e.target.value }))
          }
          className="w-full p-2 border rounded-md h-24"
          placeholder="Medical assessment, diagnosis, condition evaluation..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Recommendations
        </label>
        <textarea
          value={formData.recommendations}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              recommendations: e.target.value,
            }))
          }
          className="w-full p-2 border rounded-md h-24"
          placeholder="Treatment recommendations, medication changes, lifestyle modifications..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Treatment Plan (Optional)
        </label>
        <textarea
          value={formData.treatmentPlan}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, treatmentPlan: e.target.value }))
          }
          className="w-full p-2 border rounded-md h-20"
          placeholder="Detailed treatment plan, care instructions..."
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.followUpRequired}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                followUpRequired: e.target.checked,
              }))
            }
            className="mr-2"
          />
          Follow-up Required
        </label>

        {formData.followUpRequired && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              value={formData.followUpDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  followUpDate: e.target.value,
                }))
              }
              className="p-2 border rounded-md"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Additional Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          className="w-full p-2 border rounded-md h-16"
          placeholder="Any additional notes or observations..."
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors">
          Create Review
        </Button>
      </div>
    </form>
  );
}


