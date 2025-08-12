"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  getPatientByIdClient,
  getMedicationsClient,
  getMedicationAdministrationsClient,
  recordMedicationAdministrationClient,
} from "@/lib/api/client";
import { getVitalSigns, createVitalSigns } from "@/lib/api/vitals";
import { getMedicalReviews } from "@/lib/api/medical-reviews-client";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User,
  Plus,
  Stethoscope,
  Pill,
  Activity,
  FileText,
  Eye,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Heart,
  CheckCircle,
  X,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { RoleHeader } from "@/components/role-header";
import { useToast } from "@/hooks/use-toast";

import { PatientSymptomReportForm } from "@/components/medical/patient-symptom-report-form";
import { CaregiverPatientMobile } from "@/components/mobile/caregiver-patient-detail";
import {
  CareNotesForm,
  CareNotesHistory,
} from "@/components/medical/care-notes-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CaregiverPatientDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { user, logout, isLoading: authLoading } = useAuth();
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
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [showCaregiverNoteForm, setShowCaregiverNoteForm] = useState(false);
  const [showReviewerNoteHistory, setShowReviewerNoteHistory] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [adminFormData, setAdminFormData] = useState({
    status: "administered",
    actualTime: new Date().toISOString().slice(0, 16),
    dosageGiven: "",
    notes: "",
  });

  const isCaregiver =
    user?.role === "caregiver" || user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    // Wait for auth to finish loading before making redirect decisions
    if (authLoading) return;

    if (!user || (user.role !== "caregiver" && user.role !== "super_admin")) {
      router.push("/login");
      return;
    }

    const fetchPatientData = async () => {
      const startTime = performance.now();
      console.log(
        "🚀 Starting caregiver patient data fetch for ID:",
        resolvedParams.id
      );

      try {
        // Fetch patient data first (needed for header) - this shows immediately
        const patientStart = performance.now();
        const patientData = await getPatientByIdClient(resolvedParams.id);
        const patientEnd = performance.now();
        console.log(
          `👤 Patient data fetched in ${(patientEnd - patientStart).toFixed(
            2
          )}ms`
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
    };

    const fetchMedicalData = async (patientId: string, startTime: number) => {
      try {
        // Fetch all medical data in parallel for better performance
        const parallelStart = performance.now();
        console.log("📊 Starting parallel medical data fetch...");

        const [
          medicationsData,
          administrationsData,
          vitalsData,
          reviewsData,
          caregiverNotesData,
          reviewerNotesData,
        ] = await Promise.all([
          getMedicationsClient(patientId),
          getMedicationAdministrationsClient(patientId),
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

        // Set all data at once to minimize re-renders
        setMedications(medicationsData);
        setAdministrations(administrationsData);
        setVitals(vitalsData);
        setMedicalReviews(reviewsData as unknown as MedicalReview[]);
        setCaregiverNotes(caregiverNotesData);
        setReviewerNotes(reviewerNotesData);

        const totalEnd = performance.now();
        console.log(
          `✅ Total caregiver page load time: ${(totalEnd - startTime).toFixed(
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
    };

    fetchPatientData();
  }, [resolvedParams.id, user, router, toast]);

  // Memoized computed values for better performance
  const activeMedications = useMemo(() => {
    return medications.filter((med) => med.isActive);
  }, [medications]);

  const recentVitals = useMemo(() => {
    return vitals.slice(0, 5); // Show only recent 5 vitals
  }, [vitals]);

  const pendingAdministrations = useMemo(() => {
    return administrations.filter((admin) => admin.status === "pending");
  }, [administrations]);

  const handleVitalsSaved = useCallback(() => {
    const updatedVitals = getVitalSigns(resolvedParams.id);
    setVitals(updatedVitals);
    setShowVitalsForm(false);
    toast({
      title: "Success",
      description: "Vital signs recorded successfully",
    });
  }, [resolvedParams.id, toast]);

  const handleCaregiverNoteSaved = useCallback(async () => {
    try {
      const updatedNotes = await getCareNotes(resolvedParams.id, "caregiver");
      setCaregiverNotes(updatedNotes);
      setShowCaregiverNoteForm(false);
    } catch (error) {
      console.error("Error refreshing caregiver notes:", error);
    }
  }, [resolvedParams.id]);

  const handleReviewerNotesRefresh = useCallback(async () => {
    try {
      const updatedNotes = await getCareNotes(resolvedParams.id, "reviewer");
      setReviewerNotes(updatedNotes);
    } catch (error) {
      console.error("Error refreshing reviewer notes:", error);
    }
  }, [resolvedParams.id]);

  // Memoized helper function to get the latest administration for a medication
  const getLatestAdministration = useCallback(
    (medicationId: string) => {
      const medicationAdministrations = (administrations || []).filter(
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
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
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
        return <X className="h-3 w-3 text-gray-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  // Handle opening administration dialog
  const handleAdministrationClick = (medication: Medication) => {
    setSelectedMedication(medication);
    setAdminFormData({
      status: "administered",
      actualTime: new Date().toLocaleString(),
      dosageGiven: medication.dosage,
      notes: "",
    });
    setShowAdminDialog(true);
  };

  // Handle administration form submission
  const handleAdministrationSubmit = async () => {
    if (!selectedMedication || !user || !patient) return;

    try {
      const currentTime = new Date().toISOString();
      const administrationData = {
        medicationId: selectedMedication.id,
        patientId: patient.id,
        caregiverId: user.id,
        scheduledTime: currentTime,
        actualTime:
          adminFormData.status === "administered" ? currentTime : undefined,
        status: adminFormData.status as any,
        dosageGiven: adminFormData.dosageGiven || undefined,
        notes: adminFormData.notes || undefined,
        patientResponse: "good" as any,
      };

      await recordMedicationAdministrationClient(administrationData);

      // Refresh administrations data
      const updatedAdministrations = await getMedicationAdministrationsClient(
        patient.id
      );
      setAdministrations(updatedAdministrations);

      toast({
        title: "Administration Recorded",
        description: `${selectedMedication.medicationName} administration has been recorded.`,
      });

      // Reset form and close dialog
      setShowAdminDialog(false);
      setSelectedMedication(null);
      setAdminFormData({
        status: "administered",
        actualTime: new Date().toLocaleString(),
        dosageGiven: "",
        notes: "",
      });
    } catch (error) {
      console.error("Administration error:", error);
      toast({
        title: "Error",
        description: "Failed to record administration",
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
            <Button onClick={() => router.push("/caregiver/patients")}>
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
      <RoleHeader role="caregiver" />

      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <CaregiverPatientMobile patientId={resolvedParams.id} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/caregiver/patients")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Patients
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
            <div className=" p-3 rounded-lg">
              <p className="text-lg font-bold">
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
            <div className=" p-3 rounded-lg">
              <p className="text-lg font-bold">{patient.bloodType || "N/A"}</p>
              <p className="text-xs text-muted-foreground">Blood Type</p>
            </div>
            <div className=" p-3 rounded-lg">
              <p className="text-lg font-bold">{patient.gender || "N/A"}</p>
              <p className="text-xs text-muted-foreground">Gender</p>
            </div>
            <div className=" p-3 rounded-lg">
              <p className="text-lg font-bold">
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
            <TabsTrigger value="caregiver-notes">Caregiver Notes</TabsTrigger>
            <TabsTrigger value="reviewer-notes">Reviewer Notes</TabsTrigger>
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
                      ? `Last recorded ${formatDate(
                          new Date(vitals[0].recordedAt)
                        )}`
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
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
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
                  <div className="text-2xl font-bold">
                    {medicalReviews.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {medicalReviews.length > 0
                      ? `Last review ${formatDate(
                          new Date(medicalReviews[0].createdAt)
                        )}`
                      : "No reviews yet"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Patient Information
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

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vitals.slice(0, 3).map((vital, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium">Vitals Recorded</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(vital.recordedAt))}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          <Activity className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      </div>
                    ))}
                    {medicalReviews.slice(0, 2).map((review, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium">Medical Review</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(review.createdAt))}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-purple-600">
                          <FileText className="h-3 w-3 mr-1" />
                          {review.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Vital Signs</h2>
              <Button
                onClick={() => setShowVitalsForm(!showVitalsForm)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showVitalsForm ? "Cancel" : "Record Vitals"}
              </Button>
            </div>

            {showVitalsForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Record New Vital Signs</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuickVitalsEntry
                    patientId={resolvedParams.id}
                    patientName={`${patient.firstName} ${patient.lastName}`}
                    caregiverId={user?.id || ""}
                    onSave={handleVitalsSaved}
                    onCancel={() => setShowVitalsForm(false)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Vitals Table - Excel-like format */}
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs Records</CardTitle>
              </CardHeader>
              <CardContent>
                {(vitals || []).length > 0 ? (
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
                          <th className="text-left py-2 px-2">Notes</th>
                          <th className="text-left py-2 px-2">Alerts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(vitals || []).map((vital) => (
                          <tr
                            key={vital.id}
                            className="border-b hover:bg-gray-50"
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
                      Record the first set of vitals above
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-6">
            {/* Current Medications with Administration */}
            <Card>
              <CardHeader>
                <CardTitle>Current Medications & Administration</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  View prescribed medications and record administration
                </p>
              </CardHeader>
              <CardContent>
                {isMedicalDataLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (medications || []).filter((m) => m.isActive).length > 0 ? (
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
                          <th className="text-left py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(medications || [])
                          .filter((m) => m.isActive)
                          .map((medication) => {
                            const latestAdmin = getLatestAdministration(
                              medication.id
                            );
                            return (
                              <tr key={medication.id} className="border-b">
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
                                <td className="py-3">{medication.dosage}</td>
                                <td className="py-3 capitalize">
                                  {medication.route?.replace("_", " ") ||
                                    "Oral"}
                                </td>
                                <td className="py-3 capitalize">
                                  {medication.frequency.replace("_", " ")}
                                </td>
                                <td className="py-3">
                                  {formatDate(new Date(medication.startDate))}
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
                                              new Date(latestAdmin.actualTime)
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
                                      No administrations yet
                                    </span>
                                  )}
                                </td>
                                <td className="py-3">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="sm"
                                        className="bg-teal-600 hover:bg-teal-700"
                                      >
                                        <Pill className="h-3 w-3 mr-1" />
                                        Record Administration
                                        <ChevronDown className="h-3 w-3 ml-1" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleAdministrationClick(medication)
                                        }
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Mark as Administered
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedMedication(medication);
                                          setAdminFormData({
                                            status: "missed",
                                            actualTime:
                                              new Date().toLocaleString(),
                                            dosageGiven: "",
                                            notes: "",
                                          });
                                          setShowAdminDialog(true);
                                        }}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Mark as Missed
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedMedication(medication);
                                          setAdminFormData({
                                            status: "refused",
                                            actualTime:
                                              new Date().toLocaleString(),
                                            dosageGiven: "",
                                            notes: "",
                                          });
                                          setShowAdminDialog(true);
                                        }}
                                      >
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Mark as Refused
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No active medications prescribed yet.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Medications prescribed by reviewers will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Caregiver Notes Tab */}
          <TabsContent value="caregiver-notes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {showCaregiverNoteForm
                        ? "Create Caregiver Note"
                        : "Caregiver Notes History"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {showCaregiverNoteForm
                        ? "Create a new note for this patient"
                        : "View previous caregiver notes"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setShowCaregiverNoteForm(!showCaregiverNoteForm)
                    }
                  >
                    {showCaregiverNoteForm ? "View History" : "Create Note"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showCaregiverNoteForm ? (
                  <CareNotesForm
                    patientId={resolvedParams.id}
                    patientName={`${patient.firstName} ${patient.lastName}`}
                    authorId={user?.id || ""}
                    authorName={`${user?.firstName} ${user?.lastName}`}
                    authorRole="caregiver"
                    onSave={handleCaregiverNoteSaved}
                    onCancel={() => setShowCaregiverNoteForm(false)}
                  />
                ) : (
                  <CareNotesHistory
                    notes={caregiverNotes}
                    currentUserRole="caregiver"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviewer Notes Tab (Read-only for Caregivers) */}
          <TabsContent value="reviewer-notes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Reviewer Notes</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      View notes created by medical reviewers (read-only)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReviewerNotesRefresh}
                  >
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CareNotesHistory
                  notes={reviewerNotes}
                  currentUserRole="caregiver"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Administration Dialog */}
        <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader className="pb-3">
              <DialogTitle className="flex items-center text-lg">
                <Pill className="h-4 w-4 mr-2 text-teal-600" />
                Record Administration
              </DialogTitle>
            </DialogHeader>

            {selectedMedication && (
              <div className="space-y-3">
                {/* Medication Info - Compact */}
                <div className="bg-gray-50 p-2 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">
                        {selectedMedication.medicationName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {selectedMedication.dosage} •{" "}
                        {selectedMedication.route?.replace("_", " ") || "Oral"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-xs font-mono">
                        {adminFormData.actualTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Selection - Horizontal */}
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <RadioGroup
                    value={adminFormData.status}
                    onValueChange={(value) =>
                      setAdminFormData({ ...adminFormData, status: value })
                    }
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="administered" id="administered" />
                      <Label
                        htmlFor="administered"
                        className="flex items-center text-sm"
                      >
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                        Administered
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="missed" id="missed" />
                      <Label
                        htmlFor="missed"
                        className="flex items-center text-sm"
                      >
                        <X className="h-3 w-3 mr-1 text-red-600" />
                        Missed
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="refused" id="refused" />
                      <Label
                        htmlFor="refused"
                        className="flex items-center text-sm"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1 text-orange-600" />
                        Refused
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Dosage (for administered) - Compact */}
                {adminFormData.status === "administered" && (
                  <div>
                    <Label
                      htmlFor="dosageGiven"
                      className="text-sm font-medium"
                    >
                      Dosage Given
                    </Label>
                    <Input
                      id="dosageGiven"
                      placeholder="e.g., 10mg, 1 tablet"
                      value={adminFormData.dosageGiven}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          dosageGiven: e.target.value,
                        })
                      }
                      className="mt-1 h-8"
                    />
                  </div>
                )}

                {/* Notes - Compact */}
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notes (Optional)
                  </Label>
                  <Input
                    id="notes"
                    placeholder="Any additional notes..."
                    value={adminFormData.notes}
                    onChange={(e) =>
                      setAdminFormData({
                        ...adminFormData,
                        notes: e.target.value,
                      })
                    }
                    className="mt-1 h-8"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-3">
              <Button
                variant="outline"
                onClick={() => setShowAdminDialog(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdministrationSubmit}
                className="bg-teal-600 hover:bg-teal-700"
                size="sm"
              >
                Record Administration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Quick Vitals Entry Component - Table/Excel style
function QuickVitalsEntry({
  patientId,
  patientName,
  caregiverId,
  onSave,
  onCancel,
}: {
  patientId: string;
  patientName: string;
  caregiverId: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [vitals, setVitals] = useState({
    systolic: "",
    diastolic: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    weight: "",
    bloodSugar: "",
    notes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Basic validation
    const hasAtLeastOneVital = Object.values(vitals).some(
      (value) => value.trim() !== ""
    );

    if (!hasAtLeastOneVital) {
      toast({
        title: "No Data Entered",
        description: "Please enter at least one vital sign measurement.",
        variant: "destructive",
      });
      return;
    }

    // Mock API call - replace with actual createVitalSigns call
    const vitalData = {
      patientId,
      caregiverId,
      recordedAt: new Date().toISOString(),
      bloodPressure:
        vitals.systolic && vitals.diastolic
          ? {
              systolic: parseInt(vitals.systolic),
              diastolic: parseInt(vitals.diastolic),
            }
          : undefined,
      heartRate: vitals.heartRate ? parseInt(vitals.heartRate) : undefined,
      temperature: vitals.temperature
        ? parseFloat(vitals.temperature)
        : undefined,
      oxygenSaturation: vitals.oxygenSaturation
        ? parseInt(vitals.oxygenSaturation)
        : undefined,
      weight: vitals.weight ? parseFloat(vitals.weight) : undefined,
      bloodSugar: vitals.bloodSugar ? parseInt(vitals.bloodSugar) : undefined,
      notes: vitals.notes || undefined,
    };

    // Call actual API to save vitals
    try {
      await createVitalSigns(vitalData as any);
      toast({
        title: "Vitals Recorded",
        description: "Vital signs have been successfully recorded.",
      });
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vital signs. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Enter vitals for {patientName} • {new Date().toLocaleString()}
      </div>

      {/* Table-style input using shadcn Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">
              BP Systolic
              <br />
              <span className="text-xs text-muted-foreground">(mmHg)</span>
            </TableHead>
            <TableHead className="text-center">
              BP Diastolic
              <br />
              <span className="text-xs text-muted-foreground">(mmHg)</span>
            </TableHead>
            <TableHead className="text-center">
              Heart Rate
              <br />
              <span className="text-xs text-muted-foreground">(BPM)</span>
            </TableHead>
            <TableHead className="text-center">
              Temperature
              <br />
              <span className="text-xs text-muted-foreground">(°C)</span>
            </TableHead>
            <TableHead className="text-center">
              O2 Sat
              <br />
              <span className="text-xs text-muted-foreground">(%)</span>
            </TableHead>
            <TableHead className="text-center">
              Weight
              <br />
              <span className="text-xs text-muted-foreground">(kg)</span>
            </TableHead>
            <TableHead className="text-center">
              Blood Sugar
              <br />
              <span className="text-xs text-muted-foreground">(mg/dL)</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="p-2">
              <input
                type="number"
                placeholder="120"
                value={vitals.systolic}
                onChange={(e) => handleInputChange("systolic", e.target.value)}
                className="w-full border-0 bg-transparent text-center focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
              />
            </TableCell>
            <TableCell className="p-2">
              <input
                type="number"
                placeholder="80"
                value={vitals.diastolic}
                onChange={(e) => handleInputChange("diastolic", e.target.value)}
                className="w-full border-0 bg-transparent text-center focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
              />
            </TableCell>
            <TableCell className="p-2">
              <input
                type="number"
                placeholder="72"
                value={vitals.heartRate}
                onChange={(e) => handleInputChange("heartRate", e.target.value)}
                className="w-full border-0 bg-transparent text-center focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
              />
            </TableCell>
            <TableCell className="p-2">
              <input
                type="number"
                step="0.1"
                placeholder="36.5"
                value={vitals.temperature}
                onChange={(e) =>
                  handleInputChange("temperature", e.target.value)
                }
                className="w-full border-0 bg-transparent text-center focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
              />
            </TableCell>
            <TableCell className="p-2">
              <input
                type="number"
                placeholder="98"
                value={vitals.oxygenSaturation}
                onChange={(e) =>
                  handleInputChange("oxygenSaturation", e.target.value)
                }
                className="w-full border-0 bg-transparent text-center focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
              />
            </TableCell>
            <TableCell className="p-2">
              <input
                type="number"
                step="0.1"
                placeholder="70.0"
                value={vitals.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                className="w-full border-0 bg-transparent text-center focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
              />
            </TableCell>
            <TableCell className="p-2">
              <input
                type="number"
                placeholder="95"
                value={vitals.bloodSugar}
                onChange={(e) =>
                  handleInputChange("bloodSugar", e.target.value)
                }
                className="w-full border-0 bg-transparent text-center focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Notes section */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Notes (Optional)
        </label>
        <textarea
          placeholder="Any observations or notes about the patient's condition..."
          value={vitals.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          rows={2}
        />
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
          Save Vitals
        </Button>
      </div>
    </div>
  );
}
