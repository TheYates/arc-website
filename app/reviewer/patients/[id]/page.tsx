"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getPatientByIdClient } from "@/lib/api/client";
import {
  getMedicationsClient,
  getMedicationAdministrationsClient,
} from "@/lib/api/client";
import { getVitalSignsClient } from "@/lib/api/vitals-client";
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
import { formatDate, formatDateTime } from "@/lib/utils";
import { formatBloodType, formatGender, formatCareLevel, formatPatientStatus } from "@/lib/types/patients";

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
  DialogTrigger,
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
  RefreshCw,
  Loader2,
} from "lucide-react";
import { RoleHeader } from "@/components/role-header";
import { ReviewerPatientMobile } from "@/components/mobile/reviewer-patient-detail";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

import { PrescriptionDialog } from "@/components/medical/prescription-dialog";
import { PatientSymptomReportForm } from "@/components/medical/patient-symptom-report-form";
import {
  CareNotesForm,
  CareNotesHistory,
} from "@/components/medical/care-notes-form";
import { EditPatientDialog } from "@/components/patient/edit-patient-dialog";
import { ReviewerMedicationsTab } from "@/components/reviewer/patient-detail/ReviewerMedicationsTab";
import { ReviewerOverviewTab } from "@/components/reviewer/patient-detail/ReviewerOverviewTab";
import { ReviewerVitalsTab } from "@/components/reviewer/patient-detail/ReviewerVitalsTab";
import { ReviewerMedicalReviewsTab } from "@/components/reviewer/patient-detail/ReviewerMedicalReviewsTab";
import { ReviewerNotesTab } from "@/components/reviewer/patient-detail/ReviewerNotesTab";
import { ReviewerCareNotesTab } from "@/components/reviewer/patient-detail/ReviewerCareNotesTab";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReviewerPatientDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { user, isLoading: authLoading, isHydrated } = useAuth();
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

  const [showPatientEditForm, setShowPatientEditForm] = useState(false);





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
          getVitalSignsClient(patientId, user),
          getMedicalReviews(patientId),
          getCareNotes(patientId, "caregiver", user),
          getCareNotes(patientId, "reviewer", user),
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

        // Transform vitals data to match UI type
        const transformedVitals: VitalSigns[] = vitalsData.map((vital) => ({
          id: vital.id,
          patientId: vital.patientId,
          caregiverId: vital.recordedById,
          recordedAt: vital.recordedDate,
          bloodPressure: vital.systolicBp && vital.diastolicBp ? {
            systolic: vital.systolicBp,
            diastolic: vital.diastolicBp,
          } : undefined,
          heartRate: vital.heartRate || undefined,
          temperature: vital.temperature ? Number(vital.temperature) : undefined,
          oxygenSaturation: vital.oxygenSaturation || undefined,
          weight: vital.weightKg ? Number(vital.weightKg) : undefined,
          bloodSugar: vital.bloodSugar ? Number(vital.bloodSugar) : undefined,
          notes: vital.notes || undefined,
          isAlerted: false, // TODO: Implement alert checking from database
          alertedValues: [],
          createdAt: vital.recordedDate,
          updatedAt: vital.recordedDate,
        }));

        // Set all data at once to minimize re-renders
        setMedications(medicationsData);
        setAdministrations(administrationsData);
        setVitals(transformedVitals);
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
    // Wait for auth to finish loading and hydration before making redirect decisions
    if (authLoading || !isHydrated) return;

    if (!user || (user.role !== "reviewer" && user.role !== "super_admin")) {
      router.push("/login");
      return;
    }

    fetchPatientData();
  }, [user, router, fetchPatientData, authLoading, isHydrated]);





  const handleMedicationSaved = useCallback(async () => {
    const updatedMedications = await getMedicationsClient(
      resolvedParams.id,
      user
    );
    setMedications(updatedMedications);
    toast({
      title: "Success",
      description: "Medication prescribed successfully",
    });
  }, [resolvedParams.id, toast, user]);



  const handleReviewerNoteSaved = useCallback(async () => {
    try {
      const updatedNotes = await getCareNotes(
        resolvedParams.id,
        "reviewer",
        user
      );
      setReviewerNotes(updatedNotes);
    } catch (error) {
      console.error("Error refreshing reviewer notes:", error);
    }
  }, [resolvedParams.id, user]);

  const handleCaregiverNotesRefresh = useCallback(async () => {
    try {
      const updatedNotes = await getCareNotes(
        resolvedParams.id,
        "caregiver",
        user
      );
      setCaregiverNotes(updatedNotes);
    } catch (error) {
      console.error("Error refreshing caregiver notes:", error);
    }
  }, [resolvedParams.id, user]);

  const handleMedicationDataRefresh = useCallback(async () => {
    try {
      const [updatedMedications, updatedAdministrations] = await Promise.all([
        getMedicationsClient(resolvedParams.id, user),
        getMedicationAdministrationsClient(resolvedParams.id, user),
      ]);
      setMedications(updatedMedications);
      setAdministrations(updatedAdministrations);

      // Show success toast with Sonner
      sonnerToast.success("Medication Data Refreshed", {
        description: `Updated ${updatedMedications.length} medication(s) and ${updatedAdministrations.length} administration record(s).`,
        duration: 3000,
      });

      // Also show regular toast for consistency
      toast({
        title: "Success",
        description: "Medication data refreshed",
      });
    } catch (error) {
      console.error("Error refreshing medication data:", error);

      // Show error toast with Sonner
      sonnerToast.error("Failed to Refresh Data", {
        description: "Unable to refresh medication data. Please check your connection and try again.",
        duration: 5000,
      });

      // Also show regular toast for consistency
      toast({
        title: "Error",
        description: "Failed to refresh medication data",
        variant: "destructive",
      });
    }
  }, [resolvedParams.id, user, toast]);

  // Patient edit success handler
  const handlePatientEditSuccess = useCallback((updatedPatient: Patient) => {
    // Update the patient state with the new data
    setPatient(updatedPatient);
    // Refresh all patient data to ensure consistency
    fetchPatientData();
  }, [fetchPatientData]);

  // Auto-refresh removed - users can manually refresh using the refresh button

















  // Show loading while auth is loading, not hydrated, or patient data is loading
  if (authLoading || !isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="reviewer" />
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Only show "Patient Not Found" if we've finished loading and still don't have a patient
  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="reviewer" />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
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

        {/* Show loading skeleton for patient header while data is loading */}
        {isLoading ? (
          <>
            <div className="flex items-center space-x-4 mb-8">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-96 w-full" />
          </>
        ) : (
          <>
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
                <Badge variant="outline">
                  {formatCareLevel(patient.careLevel)} Care
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  {formatPatientStatus(patient.status)}
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
              <p className="text-xs text-muted-foreground">Age</p>
            </div>
            <div className=" p-3 rounded-lg bg-card">
              <p className="text-lg font-bold text-card-foreground">
                {formatBloodType(patient.bloodType)}
              </p>
              <p className="text-xs text-muted-foreground">Blood Type</p>
            </div>
            <div className=" p-3 rounded-lg bg-card">
              <p className="text-lg font-bold text-card-foreground">
                {formatGender(patient.gender)}
              </p>
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
        {user ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="medical-reviews">Reviews</TabsTrigger>
            <TabsTrigger value="reviewer-notes">Reviewer Notes</TabsTrigger>
            <TabsTrigger value="caregiver-notes">Caregiver Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <ReviewerOverviewTab
              patient={patient}
              user={user}
              medications={medications || []}
              vitals={vitals}
              medicalReviews={medicalReviews}
              isMedicalDataLoading={isMedicalDataLoading}
            />
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-6">
            <ReviewerVitalsTab
              patient={patient}
              user={user}
              vitals={vitals}
              isMedicalDataLoading={isMedicalDataLoading}
            />
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-6">
            <ReviewerMedicationsTab
              patient={patient}
              user={user}
              medications={medications}
              administrations={administrations}
              isMedicalDataLoading={isMedicalDataLoading}
              onMedicationDataRefresh={handleMedicationDataRefresh}
              onShowPrescribeDialog={() => setShowPrescribeDialog(true)}
            />
          </TabsContent>

          {/* Medical Reviews Tab */}
          <TabsContent value="medical-reviews" className="space-y-6">
            <ReviewerMedicalReviewsTab
              patient={patient}
              user={user}
              medicalReviews={medicalReviews}
              onRefresh={handleMedicationDataRefresh}
            />
          </TabsContent>

          {/* Reviewer Notes Tab */}
          <TabsContent value="reviewer-notes" className="space-y-6">
            <ReviewerNotesTab
              patient={patient}
              user={user}
              reviewerNotes={reviewerNotes}
              onReviewerNoteSaved={handleReviewerNoteSaved}
            />
          </TabsContent>

          {/* Caregiver Notes Tab */}
          <TabsContent value="caregiver-notes" className="space-y-6">
            <ReviewerCareNotesTab
              patient={patient}
              user={user}
              caregiverNotes={caregiverNotes}
              onRefresh={handleCaregiverNotesRefresh}
            />
          </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading user information...</p>
          </div>
        )}
        </>
        )}
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

      {/* Patient Edit Dialog */}
      {patient && (
        <EditPatientDialog
          patient={patient}
          isOpen={showPatientEditForm}
          onClose={() => setShowPatientEditForm(false)}
          onSuccess={handlePatientEditSuccess}
          userRole={user?.role === "super_admin" ? "admin" : "reviewer"}
        />
      )}
    </div>
  );
}