"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { recordMedicationAdministrationClient } from "@/lib/api/client";
import {
  usePatientBasicInfo,
  usePatientOverviewData,
  usePatientMedicationsData,
  usePatientVitalsData,
  usePatientCareNotesData,
  useTabPrefetching
} from "@/hooks/use-patient-tabs";
import { Patient } from "@/lib/types/patients";
import { Medication } from "@/lib/types/medications";
import { formatDate } from "@/lib/utils";
import {
  formatBloodType,
  formatGender,
  formatCareLevel,
  formatPatientStatus,
} from "@/lib/types/patients";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CaregiverMedicationsTab } from "@/components/caregiver/patient-detail/CaregiverMedicationsTab";
import { CaregiverOverviewTab } from "@/components/caregiver/patient-detail/CaregiverOverviewTab";
import { CaregiverVitalsTab } from "@/components/caregiver/patient-detail/CaregiverVitalsTab";
import { CaregiverNotesTab } from "@/components/caregiver/patient-detail/CaregiverNotesTab";
import { CaregiverReviewerNotesTab } from "@/components/caregiver/patient-detail/CaregiverReviewerNotesTab";
import { CaregiverTasksTab } from "@/components/caregiver/patient-detail/CaregiverTasksTab";
import { MedicationsTabLoading, VitalsTabLoading, NotesTabLoading } from "@/components/ui/tab-loading";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  X,
  Pill,
} from "lucide-react";
import { RoleHeader } from "@/components/role-header";
import { useToast } from "@/hooks/use-toast";
import { EditPatientDialog } from "@/components/patient/edit-patient-dialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CaregiverPatientDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { user, isLoading: authLoading, isHydrated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // 🚀 Enterprise Lazy Loading - Load data based on active tab

  // Always load basic patient info
  const {
    data: patient,
    isLoading: isPatientLoading,
    error: patientError,
    refetch: refetchPatient
  } = usePatientBasicInfo(resolvedParams.id);

  // Tab-specific data loading
  const overviewData = usePatientOverviewData(resolvedParams.id, activeTab === 'overview');
  const medicationsData = usePatientMedicationsData(resolvedParams.id, activeTab === 'medications');
  const vitalsData = usePatientVitalsData(resolvedParams.id, activeTab === 'vitals');
  const careNotesData = usePatientCareNotesData(
    resolvedParams.id,
    activeTab === 'caregiver-notes' || activeTab === 'reviewer-notes'
  );

  // Enable smart prefetching
  useTabPrefetching(resolvedParams.id, activeTab);

  // Extract data for backward compatibility
  const medications = medicationsData.medications || [];
  const administrations = medicationsData.administrations || [];
  const vitals = vitalsData.vitals || [];
  const caregiverNotes = careNotesData.caregiverNotes || [];
  const reviewerNotes = careNotesData.reviewerNotes || [];
  const medicalReviews: any[] = []; // Not used in caregiver view

  // Loading states
  const isLoading = isPatientLoading;
  const isMedicalDataLoading = medicationsData.isLoading || vitalsData.isLoading || careNotesData.isLoading;

  // Refetch functions
  const refetchAll = () => {
    refetchPatient();
    if (activeTab === 'overview') overviewData.refetch();
    if (activeTab === 'medications') medicationsData.refetch();
    if (activeTab === 'vitals') vitalsData.refetch();
    if (activeTab.includes('notes')) careNotesData.refetch();
  };
  const refetchAdministrations = medicationsData.refetch; // Same as medications
  const refetchVitals = vitalsData.refetch;

  // UI states
  const [showPatientEditForm, setShowPatientEditForm] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [adminFormData, setAdminFormData] = useState({
    status: "administered",
    actualTime: new Date().toISOString().slice(0, 16),
    dosageGiven: "",
    notes: "",
  });



  useEffect(() => {
    // Wait for auth to finish loading and hydration before making redirect decisions
    if (authLoading || !isHydrated) return;

    if (!user || (user.role !== "caregiver" && user.role !== "super_admin")) {
      router.push("/login");
      return;
    }
  }, [authLoading, isHydrated, user, router]);



  // 🚀 TanStack Query - Simplified refresh handlers
  const handleCaregiverNoteSaved = useCallback(async () => {
    refetchAll(); // Refetch all data including care notes
  }, [refetchAll]);

  const handleReviewerNotesRefresh = useCallback(async () => {
    refetchAll(); // Refetch all data including care notes
  }, [refetchAll]);

  // Wrapper functions for component compatibility
  const handleVitalsUpdate = useCallback(() => {
    refetchVitals();
  }, [refetchVitals]);

  const handleAdministrationsUpdate = useCallback(() => {
    refetchAdministrations();
  }, [refetchAdministrations]);

  // Handle administration form submission
  const handleAdministrationSubmit = async () => {
    if (!selectedMedication || !user || !patient) return;

    try {
      const currentTime = new Date().toISOString();
      const administrationData = {
        prescriptionId: selectedMedication.id, // This is actually a prescription ID
        patientId: patient.id,
        administeredById: user.id, // Use the correct field name
        scheduledTime: currentTime,
        administeredTime:
          adminFormData.status === "administered" ? currentTime : undefined,
        status: adminFormData.status as any,
        dosageGiven: adminFormData.dosageGiven || undefined,
        notes: adminFormData.notes || undefined,
        patientResponse: "good" as any,
        createdAt: currentTime,
        updatedAt: currentTime,
      };

      await recordMedicationAdministrationClient(administrationData, user);

      // 🚀 TanStack Query - Refresh administrations data
      refetchAdministrations();

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

  const handlePatientEditSuccess = (updatedPatient: Patient) => {
    // 🚀 TanStack Query - Refetch patient data to get latest updates
    refetchAll();
    toast({
      title: "Patient updated",
      description: "Patient information has been successfully updated.",
    });
  };

  // Show loading while auth is loading, not hydrated, or patient data is loading
  if (authLoading || !isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleHeader role="caregiver" />

      {/* Responsive UI */}
      <div className="container mx-auto px-4 py-6 space-y-6">
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

        {/* Show patient not found if no patient data */}
        {!patient ? (
          <div className="flex items-center justify-center py-32">
            <Card className="w-96">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">
                  Patient Not Found
                </h2>
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
                  <p className="text-xs text-muted-foreground">Age</p>
                </div>
                <div className=" p-3 rounded-lg">
                  <p className="text-lg font-bold">
                    {formatBloodType(patient.bloodType)}
                  </p>
                  <p className="text-xs text-muted-foreground">Blood Type</p>
                </div>
                <div className=" p-3 rounded-lg">
                  <p className="text-lg font-bold">
                    {formatGender(patient.gender)}
                  </p>
                  <p className="text-xs text-muted-foreground">Gender</p>
                </div>
                <div className=" p-3 rounded-lg">
                  <p className="text-lg font-bold">
                    {patient.heightCm && patient.weightKg
                      ? `${patient.heightCm}cm / ${patient.weightKg}kg`
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Height / Weight
                  </p>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="vitals">Vitals</TabsTrigger>
                <TabsTrigger value="medications">
                  Medications & Administration
                </TabsTrigger>
                <TabsTrigger value="caregiver-notes">
                  Caregiver Notes
                </TabsTrigger>
                <TabsTrigger value="reviewer-notes">Reviewer Notes</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {user && (
                  <CaregiverOverviewTab
                    patient={patient}
                    user={user}
                    medications={medications || []}
                    vitals={vitals}
                    medicalReviews={medicalReviews}
                    isMedicalDataLoading={isMedicalDataLoading}
                    onEditPatient={() => setShowPatientEditForm(true)}
                  />
                )}
              </TabsContent>

              {/* Vitals Tab */}
              <TabsContent value="vitals" className="space-y-6">
                {user && (
                  <>
                    {vitalsData.isLoading ? (
                      <VitalsTabLoading />
                    ) : (
                      <CaregiverVitalsTab
                        patient={patient}
                        user={user}
                        vitals={vitals}
                        onVitalsUpdate={handleVitalsUpdate}
                      />
                    )}
                  </>
                )}
              </TabsContent>

              {/* Medications & Administration Tab */}
              <TabsContent value="medications" className="space-y-6">
                {user && (
                  <>
                    {medicationsData.isLoading ? (
                      <MedicationsTabLoading />
                    ) : (
                      <CaregiverMedicationsTab
                        patient={patient}
                        user={user}
                        medications={medications || []}
                        administrations={administrations || []}
                        isMedicalDataLoading={isMedicalDataLoading}
                        onAdministrationsUpdate={handleAdministrationsUpdate}
                      />
                    )}
                  </>
                )}
              </TabsContent>

              {/* Caregiver Notes Tab */}
              <TabsContent value="caregiver-notes" className="space-y-6">
                {user && (
                  <>
                    {careNotesData.isLoading ? (
                      <NotesTabLoading />
                    ) : (
                      <CaregiverNotesTab
                        patient={patient}
                        user={user}
                        caregiverNotes={caregiverNotes}
                        onNoteSaved={handleCaregiverNoteSaved}
                      />
                    )}
                  </>
                )}
              </TabsContent>

              {/* Reviewer Notes Tab (Read-only for Caregivers) */}
              <TabsContent value="reviewer-notes" className="space-y-6">
                {user && (
                  <>
                    {careNotesData.isLoading ? (
                      <NotesTabLoading />
                    ) : (
                      <CaregiverReviewerNotesTab
                        patient={patient}
                        user={user}
                        reviewerNotes={reviewerNotes}
                        onRefresh={handleReviewerNotesRefresh}
                      />
                    )}
                  </>
                )}
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-6">
                {user && (
                  <CaregiverTasksTab
                    patient={patient}
                    user={user}
                  />
                )}
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
                    <div className="p-2 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">
                            {selectedMedication.medicationName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {selectedMedication.dosage} •{" "}
                            {selectedMedication.route?.replace("_", " ") ||
                              "Oral"}
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
                          <RadioGroupItem
                            value="administered"
                            id="administered"
                          />
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
          </>
        )}

        {/* Patient Edit Dialog */}
        {patient && (
          <EditPatientDialog
            patient={patient}
            isOpen={showPatientEditForm}
            onClose={() => setShowPatientEditForm(false)}
            onSuccess={handlePatientEditSuccess}
            userRole="caregiver"
          />
        )}
      </div>
    </div>
  );
}
