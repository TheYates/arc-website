"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  getPatientByIdClient,
  getMedicationsClient,
  getMedicationAdministrationsClient,
  recordMedicationAdministrationClient,
} from "@/lib/api/client";
import { getVitalSigns, createVitalSigns } from "@/lib/api/vitals";
import { getMedicalReviews } from "@/lib/api/medical-reviews";
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CaregiverPatientDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { user, logout } = useAuth();
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
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
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
    user?.role === "care_giver" || user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    if (!user || (user.role !== "care_giver" && user.role !== "super_admin")) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const patientData = await getPatientByIdClient(resolvedParams.id);
        setPatient(patientData);

        if (patientData) {
          // Load medical data
          const medicationsData = await getMedicationsClient(resolvedParams.id);
          setMedications(medicationsData);

          const administrationsData = await getMedicationAdministrationsClient(
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

  const handleVitalsSaved = () => {
    const updatedVitals = getVitalSigns(resolvedParams.id);
    setVitals(updatedVitals);
    setShowVitalsForm(false);
    toast({
      title: "Success",
      description: "Vital signs recorded successfully",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="caregiver" />
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              <AvatarFallback className="bg-teal-100 text-teal-600 text-xl">
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
                <Badge className="bg-teal-100 text-teal-800 capitalize">
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
                {medications.filter((m) => m.isActive).length > 0 ? (
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

          {/* Medical Notes Tab */}
          <TabsContent value="medical-notes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Medical Notes & Reviews</h2>
              <Button
                onClick={() => setShowSymptomForm(!showSymptomForm)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showSymptomForm ? "Cancel" : "Report Symptoms"}
              </Button>
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

            {/* Medical Reviews List (Read-only for Caregivers) */}
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
                      Medical reviews will appear here when created by reviewers
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
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
