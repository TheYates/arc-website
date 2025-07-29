"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getPatientById } from "@/lib/api/patients";
import {
  getMedications,
  getMedicationAdministrations,
} from "@/lib/api/medications";
import { getVitalSigns } from "@/lib/api/vitals";
import {
  getMedicalReviews,
  createMedicalReview,
} from "@/lib/api/medical-reviews";
import { Patient } from "@/lib/types/patients";
import { Medication, MedicationAdministration } from "@/lib/types/medications";
import { VitalSigns } from "@/lib/types/vitals";
import { MedicalReview } from "@/lib/types/medical-reviews";
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
} from "lucide-react";
import { RoleHeader } from "@/components/role-header";
import { useToast } from "@/hooks/use-toast";

import { PrescriptionDialog } from "@/components/medical/prescription-dialog";
import { PatientSymptomReportForm } from "@/components/medical/patient-symptom-report-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReviewerPatientDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Medical data states
  const [medications, setMedications] = useState<Medication[]>([]);
  const [administrations, setAdministrations] = useState<
    MedicationAdministration[]
  >([]);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [medicalReviews, setMedicalReviews] = useState<MedicalReview[]>([]);

  // UI states
  const [showPrescribeDialog, setShowPrescribeDialog] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [showCreateReviewDialog, setShowCreateReviewDialog] = useState(false);

  // Prescription states
  const [selectedMedication, setSelectedMedication] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
  const [medicationSearchOpen, setMedicationSearchOpen] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(true);

  // Common medications list
  const commonMedications = [
    "Lisinopril",
    "Metformin",
    "Amlodipine",
    "Metoprolol",
    "Omeprazole",
    "Simvastatin",
    "Losartan",
    "Albuterol",
    "Gabapentin",
    "Sertraline",
    "Ibuprofen",
    "Acetaminophen",
    "Aspirin",
    "Hydrochlorothiazide",
    "Atorvastatin",
  ];

  useEffect(() => {
    if (!user || (user.role !== "reviewer" && user.role !== "super_admin")) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const patientData = await getPatientById(resolvedParams.id);
        setPatient(patientData);

        if (patientData) {
          // Load medical data
          const medicationsData = getMedications(resolvedParams.id);
          setMedications(medicationsData);

          const administrationsData = getMedicationAdministrations(
            resolvedParams.id
          );
          setAdministrations(administrationsData);

          const vitalsData = getVitalSigns(resolvedParams.id);
          setVitals(vitalsData);

          const reviewsData = getMedicalReviews(resolvedParams.id);
          setMedicalReviews(reviewsData);
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, user, router, toast]);

  const handleMedicationSaved = () => {
    const updatedMedications = getMedications(resolvedParams.id);
    setMedications(updatedMedications);
    toast({
      title: "Success",
      description: "Medication prescribed successfully",
    });
  };

  const handleReviewSaved = () => {
    const updatedReviews = getMedicalReviews(resolvedParams.id);
    setMedicalReviews(updatedReviews);
    setShowCreateReviewDialog(false);
    toast({
      title: "Success",
      description: "Medical review created successfully",
    });
  };

  // Helper function to get the latest administration for a medication
  const getLatestAdministration = (medicationId: string) => {
    const medicationAdministrations = administrations.filter(
      (admin) => admin.medicationId === medicationId
    );
    if (medicationAdministrations.length === 0) return null;

    return medicationAdministrations.sort(
      (a, b) =>
        new Date(b.actualTime || b.scheduledTime).getTime() -
        new Date(a.actualTime || a.scheduledTime).getTime()
    )[0];
  };

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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Convert prescription items to medication format and add to current medications
      const newMedications = prescriptionItems.map((item) => ({
        id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        patientId: resolvedParams.id,
        medicationName: item.medicationName,
        dosage: item.dosage || "As prescribed",
        route: item.route,
        frequency: item.frequency,
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
        isActive: true,
        isPRN: item.frequency === "as_needed",
        priority: "medium" as const,
        category: "other" as const,
        prescribedBy: "Dr. Reviewer", // In real app, this would be the current user
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastModifiedBy: "Dr. Reviewer",
      }));

      // Add new medications to the existing list
      setMedications((prev) => [...prev, ...newMedications]);

      toast({
        title: "Prescriptions saved successfully",
        description: `${prescriptionItems.length} medication(s) have been prescribed for ${patient?.firstName} ${patient?.lastName}.`,
      });

      // Clear the prescription items after successful save
      setPrescriptionItems([]);

      // Switch to current medications view to show the newly added medications
      setShowAddPrescription(false);
    } catch (error) {
      toast({
        title: "Error saving prescriptions",
        description:
          "There was an error saving the prescriptions. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-8 w-24" />
          </div>
        </header>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/reviewer/patients")}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
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

          {/* Quick Stats */}
          <div className="flex space-x-6 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {vitals.length}
              </p>
              <p className="text-sm text-muted-foreground">Vitals Recorded</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {medications.filter((m) => m.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">
                Active Medications
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {medicalReviews.length}
              </p>
              <p className="text-sm text-muted-foreground">Medical Reviews</p>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="medical-notes">Medical Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                          className="pl-10"
                        />
                        {medicationSearchOpen &&
                          selectedMedication.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
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
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                                    onClick={() =>
                                      addMedicationToPrescription(medication)
                                    }
                                  >
                                    {medication}
                                  </div>
                                ))}
                              {commonMedications.filter((med) =>
                                med
                                  .toLowerCase()
                                  .includes(selectedMedication.toLowerCase())
                              ).length === 0 && (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                  No medications found
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
                                      className="text-red-600 hover:text-red-700"
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
                              className="bg-purple-600 hover:bg-purple-700"
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
                                    {medication.route.replace("_", " ")}
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
                    {medications.filter((m) => m.isActive).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No active medications found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Notes Tab */}
          <TabsContent value="medical-notes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Medical Notes & Reviews</h2>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowCreateReviewDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Review
                </Button>
                <Button
                  onClick={() => setShowSymptomForm(!showSymptomForm)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showSymptomForm ? "Cancel" : "Report Symptoms"}
                </Button>
              </div>
            </div>

            {showSymptomForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Report Patient Symptoms</CardTitle>
                </CardHeader>
                <CardContent>
                  <PatientSymptomReportForm
                    patientId={resolvedParams.id}
                    patientName={`${patient.firstName} ${patient.lastName}`}
                    onSave={() => {
                      setShowSymptomForm(false);
                      toast({
                        title: "Success",
                        description: "Symptom report submitted successfully",
                      });
                    }}
                    onCancel={() => setShowSymptomForm(false)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Medical Reviews List */}
            <div className="space-y-4">
              {medicalReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {review.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by {review.reviewerName} •{" "}
                          {formatDate(new Date(review.createdAt))}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge
                          variant={
                            review.status === "completed"
                              ? "default"
                              : "outline"
                          }
                          className={
                            review.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : review.priority === "high"
                              ? "bg-orange-100 text-orange-800"
                              : review.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {review.priority} priority
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {review.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Findings</h4>
                        <p className="text-sm text-muted-foreground">
                          {review.findings}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Assessment</h4>
                        <p className="text-sm text-muted-foreground">
                          {review.assessment}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          Recommendations
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {review.recommendations}
                        </p>
                      </div>
                      {review.followUpRequired && review.followUpDate && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>
                            Follow-up required by{" "}
                            {formatDate(new Date(review.followUpDate))}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {medicalReviews.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No medical reviews yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Create your first medical review to get started
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
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

      {/* Create Review Dialog */}
      <Dialog
        open={showCreateReviewDialog}
        onOpenChange={setShowCreateReviewDialog}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Medical Review</DialogTitle>
          </DialogHeader>
          <CreateMedicalReviewForm
            patientId={resolvedParams.id}
            reviewerId={user?.id || ""}
            reviewerName={`${user?.firstName} ${user?.lastName}`}
            onSave={handleReviewSaved}
            onCancel={() => setShowCreateReviewDialog(false)}
          />
        </DialogContent>
      </Dialog>
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
    type: "routine_checkup" as any,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMedicalReview({
      ...formData,
      patientId,
      reviewerId,
      reviewerName,
    });

    onSave();
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
            <option value="routine_checkup">Routine Checkup</option>
            <option value="follow_up">Follow-up</option>
            <option value="emergency_consultation">
              Emergency Consultation
            </option>
            <option value="medication_review">Medication Review</option>
            <option value="symptom_evaluation">Symptom Evaluation</option>
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
            <option value="urgent">Urgent</option>
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
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          Create Review
        </Button>
      </div>
    </form>
  );
}
