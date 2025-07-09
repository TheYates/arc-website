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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Heart,
  Activity,
  Pill,
  FileText,
  Plus,
  Clock,
  Save,
} from "lucide-react";

// Utility function to format dates and times for caregiver role
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const fullDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { fullDate, time };
};

const formatDateOnly = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCompactDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const compactDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${compactDate} at ${time}`;
};

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
  medications: number;
  notes: string;
  riskFactors: string[];
  allergies: string[];
}

interface QuickVitals {
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  respiratoryRate: string;
  bloodGlucose: string;
  weight: string;
  height: string;
  painLevel: string;
}

interface QuickMedication {
  medicationName: string;
  dosage: string;
  administeredTime: string;
  notes: string;
}

interface QuickNote {
  type: "general" | "medication" | "vitals" | "behavioral" | "emergency";
  content: string;
  priority: "low" | "medium" | "high";
}

interface VitalRecord {
  id: string;
  patientId: string;
  // Basic vitals
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  // Extended vitals
  respiratoryRate: string;
  bloodGlucose?: string;
  weight?: string;
  height?: string;
  bmi?: string;
  painLevel?: string; // 1-10 scale
  // Metadata
  recordedDate: string;
  recordedBy: string;
}

interface PrescribedMedication {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescribedBy: string;
  prescribedDate: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

interface MedicationAdministration {
  id: string;
  prescriptionId: string;
  patientId: string;
  scheduledTime: string;
  administeredTime?: string;
  administeredBy?: string;
  status: "pending" | "administered" | "missed" | "refused" | "delayed";
  notes?: string;
  sideEffects?: string[];
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

export default function PatientDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Comprehensive data states
  const [vitalRecords, setVitalRecords] = useState<VitalRecord[]>([]);
  const [prescribedMedications, setPrescribedMedications] = useState<
    PrescribedMedication[]
  >([]);
  const [medicationAdministrations, setMedicationAdministrations] = useState<
    MedicationAdministration[]
  >([]);
  const [careNotes, setCareNotes] = useState<CareNote[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Quick entry states
  const [quickVitals, setQuickVitals] = useState<QuickVitals>({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    respiratoryRate: "",
    bloodGlucose: "",
    weight: "",
    height: "",
    painLevel: "",
  });

  const [quickNote, setQuickNote] = useState<QuickNote>({
    type: "general",
    content: "",
    priority: "medium",
  });

  // Allergy management state
  const [newAllergy, setNewAllergy] = useState("");
  const [isAddingAllergy, setIsAddingAllergy] = useState(false);

  // Medication confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    administrationId: string;
    action: "administered" | "missed" | "refused";
    medicationName: string;
  }>({
    isOpen: false,
    administrationId: "",
    action: "administered",
    medicationName: "",
  });

  // Pagination state
  const [vitalsPage, setVitalsPage] = useState(1);
  const [medicationsPage, setMedicationsPage] = useState(1);
  const [notesPage, setNotesPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 5;

  // Mock patient data - in real app, this would come from API
  const mockPatients: Patient[] = [
    {
      id: "5",
      name: "Akosua Asante",
      age: 67,
      gender: "female",
      conditions: ["Hypertension", "Diabetes Type 2", "Arthritis"],
      careLevel: "medium",
      status: "stable",
      assignedDate: "2024-01-10",
      lastVisit: "2024-01-15",
      nextVisit: "2024-01-17",
      address: "123 Accra Street, Accra",
      phone: "+233 24 000 0005",
      emergencyContact: {
        name: "Kwame Asante",
        relationship: "Son",
        phone: "+233 24 111 1111",
      },
      vitals: {
        bloodPressure: "135/85",
        heartRate: "82",
        temperature: "36.7°C",
        oxygenSaturation: "97%",
        recordedDate: "2024-01-15T10:30:00Z",
      },
      medications: 4,
      notes:
        "Patient is responding well to current treatment plan. Blood pressure slightly elevated but within acceptable range.",
      riskFactors: ["Fall Risk", "Medication Compliance"],
      allergies: ["Penicillin", "Shellfish"],
    },
    {
      id: "6",
      name: "Kofi Mensah",
      age: 72,
      gender: "male",
      conditions: ["Type 2 Diabetes", "Diabetic Neuropathy", "Hypertension"],
      careLevel: "medium",
      status: "stable",
      assignedDate: "2024-01-05",
      lastVisit: "2024-01-16",
      nextVisit: "2024-01-18",
      address: "456 Tema Avenue, Tema",
      phone: "+233 24 000 0006",
      emergencyContact: {
        name: "Ama Mensah",
        relationship: "Wife",
        phone: "+233 24 222 2222",
      },
      vitals: {
        bloodPressure: "140/85",
        heartRate: "78",
        temperature: "36.8°C",
        oxygenSaturation: "98%",
        recordedDate: "2024-01-16T08:15:00Z",
      },
      medications: 3,
      notes:
        "Blood sugar levels stable. Neuropathy pain managed well with current medications.",
      riskFactors: ["Diabetes", "Neuropathy"],
      allergies: ["Aspirin"],
    },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && user.role !== "care_giver") {
      router.push("/dashboard");
    }
    if (user && user.role === "care_giver") {
      loadPatient();
    }
  }, [user, authLoading, router, patientId]);

  const loadPatient = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const foundPatient = mockPatients.find((p) => p.id === patientId);
    setPatient(foundPatient || null);

    // Load comprehensive data
    if (foundPatient) {
      await loadPatientData(foundPatient.id);
    }

    setIsLoading(false);
  };

  const loadPatientData = async (patientId: string) => {
    setIsLoadingData(true);

    // Mock vital records
    const mockVitals: VitalRecord[] = [
      {
        id: "v1",
        patientId,
        bloodPressure: "135/85",
        heartRate: "82",
        temperature: "36.7",
        oxygenSaturation: "97",
        respiratoryRate: "16",
        weight: "68",
        height: "165",
        recordedDate: "2024-01-15T10:30:00Z",
        recordedBy: "Nurse Sarah",
      },
      {
        id: "v2",
        patientId,
        bloodPressure: "140/88",
        heartRate: "85",
        temperature: "36.8",
        oxygenSaturation: "96",
        respiratoryRate: "18",
        bloodGlucose: "110",
        weight: "70",
        painLevel: "3",
        recordedDate: "2024-01-14T08:15:00Z",
        recordedBy: "Nurse John",
      },
    ];

    // Mock prescribed medications
    const mockPrescriptions: PrescribedMedication[] = [
      {
        id: "p1",
        patientId,
        medicationName: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily (morning and evening)",
        instructions: "Take with meals to reduce stomach upset",
        prescribedBy: "Dr. Smith",
        prescribedDate: "2024-01-10T09:00:00Z",
        startDate: "2024-01-10",
        endDate: "2024-02-10",
        isActive: true,
      },
      {
        id: "p2",
        patientId,
        medicationName: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily (morning)",
        instructions:
          "Take at the same time each day, preferably in the morning",
        prescribedBy: "Dr. Smith",
        prescribedDate: "2024-01-10T09:00:00Z",
        startDate: "2024-01-10",
        isActive: true,
      },
    ];

    // Mock medication administrations
    const mockAdministrations: MedicationAdministration[] = [
      {
        id: "a1",
        prescriptionId: "p1",
        patientId,
        scheduledTime: "2024-01-15T08:00:00Z",
        administeredTime: "2024-01-15T08:15:00Z",
        administeredBy: "Nurse Sarah",
        status: "administered",
        notes: "Taken with breakfast, no side effects",
      },
      {
        id: "a2",
        prescriptionId: "p1",
        patientId,
        scheduledTime: "2024-01-15T20:00:00Z",
        administeredTime: "2024-01-15T20:10:00Z",
        administeredBy: "Nurse Sarah",
        status: "administered",
        notes: "Taken with dinner",
      },
      {
        id: "a3",
        prescriptionId: "p2",
        patientId,
        scheduledTime: "2024-01-15T08:00:00Z",
        administeredTime: "2024-01-15T08:15:00Z",
        administeredBy: "Nurse Sarah",
        status: "administered",
        notes: "For blood pressure control",
      },
      {
        id: "a4",
        prescriptionId: "p1",
        patientId,
        scheduledTime: "2024-01-16T08:00:00Z",
        status: "pending",
      },
      {
        id: "a5",
        prescriptionId: "p2",
        patientId,
        scheduledTime: "2024-01-16T08:00:00Z",
        status: "pending",
      },
    ];

    // Mock care notes
    const mockNotes: CareNote[] = [
      {
        id: "n1",
        patientId,
        type: "general",
        content:
          "Patient is responding well to current treatment plan. Blood pressure slightly elevated but within acceptable range.",
        priority: "medium",
        createdDate: "2024-01-15T14:30:00Z",
        createdBy: "Nurse Sarah",
      },
      {
        id: "n2",
        patientId,
        type: "vitals",
        content:
          "Blood pressure trending upward. Recommend monitoring more frequently.",
        priority: "high",
        createdDate: "2024-01-14T16:45:00Z",
        createdBy: "Nurse John",
      },
    ];

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setVitalRecords(mockVitals);
    setPrescribedMedications(mockPrescriptions);
    setMedicationAdministrations(mockAdministrations);
    setCareNotes(mockNotes);
    setIsLoadingData(false);
  };

  const handleQuickVitalsSubmit = async () => {
    if (!patient) return;

    // Create new vital record
    const newVital: VitalRecord = {
      id: `v${Date.now()}`,
      patientId: patient.id,
      bloodPressure: `${quickVitals.bloodPressureSystolic}/${quickVitals.bloodPressureDiastolic}`,
      heartRate: quickVitals.heartRate,
      temperature: quickVitals.temperature,
      oxygenSaturation: quickVitals.oxygenSaturation,
      respiratoryRate: quickVitals.respiratoryRate,
      bloodGlucose: quickVitals.bloodGlucose || undefined,
      weight: quickVitals.weight || undefined,
      height: quickVitals.height || undefined,
      bmi:
        quickVitals.weight && quickVitals.height
          ? (
              parseFloat(quickVitals.weight) /
              Math.pow(parseFloat(quickVitals.height) / 100, 2)
            ).toFixed(1)
          : undefined,
      painLevel: quickVitals.painLevel || undefined,
      recordedDate: new Date().toISOString(),
      recordedBy: "Current Caregiver",
    };

    // Add to vital records list
    setVitalRecords((prev) => [newVital, ...prev]);

    // Reset form
    setQuickVitals({
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      heartRate: "",
      temperature: "",
      oxygenSaturation: "",
      respiratoryRate: "",
      bloodGlucose: "",
      weight: "",
      height: "",
      painLevel: "",
    });

    // Show success message
    alert("Vitals recorded successfully!");
  };

  const openConfirmationDialog = (
    administrationId: string,
    action: "administered" | "missed" | "refused"
  ) => {
    const administration = medicationAdministrations.find(
      (admin) => admin.id === administrationId
    );
    const prescription = prescribedMedications.find(
      (p) => p.id === administration?.prescriptionId
    );

    setConfirmationDialog({
      isOpen: true,
      administrationId,
      action,
      medicationName: prescription?.medicationName || "Unknown medication",
    });
  };

  const handleMedicationAdministration = async (
    administrationId: string,
    status: "administered" | "missed" | "refused",
    notes?: string
  ) => {
    if (!patient) return;

    // Update the administration record
    setMedicationAdministrations((prev) =>
      prev.map((admin) =>
        admin.id === administrationId
          ? {
              ...admin,
              status,
              administeredTime:
                status === "administered"
                  ? new Date().toISOString()
                  : undefined,
              administeredBy:
                status === "administered" ? "Current Caregiver" : undefined,
              notes: notes || admin.notes,
            }
          : admin
      )
    );

    // Close dialog and show success message
    setConfirmationDialog({
      isOpen: false,
      administrationId: "",
      action: "administered",
      medicationName: "",
    });
    const statusText =
      status === "administered"
        ? "administered"
        : status === "missed"
        ? "marked as missed"
        : "marked as refused";
    alert(`Medication ${statusText} successfully!`);
  };

  const handleQuickMedicationSubmit = async () => {
    // This function is now used for marking medications as administered
    // The actual medication entry is handled by the administration workflow
    alert(
      "Please use the medication schedule below to mark medications as administered."
    );
  };

  const handleQuickNoteSubmit = async () => {
    if (!patient) return;

    // Create new care note
    const newNote: CareNote = {
      id: `n${Date.now()}`,
      patientId: patient.id,
      type: quickNote.type,
      content: quickNote.content,
      priority: quickNote.priority,
      createdDate: new Date().toISOString(),
      createdBy: "Current Caregiver",
    };

    // Add to care notes list
    setCareNotes((prev) => [newNote, ...prev]);

    // Reset form
    setQuickNote({
      type: "general",
      content: "",
      priority: "medium",
    });

    // Show success message
    alert("Care note added successfully!");
  };

  const handleAddAllergy = async () => {
    if (!patient || !newAllergy.trim()) return;

    // Update patient allergies (in real app, this would be an API call)
    const updatedPatient = {
      ...patient,
      allergies: [...patient.allergies, newAllergy.trim()],
    };

    // Reset form
    setNewAllergy("");
    setIsAddingAllergy(false);

    // Show success message
    alert("Allergy added successfully!");
  };

  // Pagination helper functions
  const getPaginatedData = <T,>(data: T[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      data: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / itemsPerPage),
      hasNext: endIndex < data.length,
      hasPrev: page > 1,
    };
  };

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
    hasNext,
    hasPrev,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNext: boolean;
    hasPrev: boolean;
  }) => (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-slate-600">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-green-100 text-green-800";
      case "improving":
        return "bg-blue-100 text-blue-800";
      case "declining":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getCareLevel = (level: string) => {
    switch (level) {
      case "low":
        return { color: "bg-green-100 text-green-800", label: "Low Care" };
      case "medium":
        return { color: "bg-yellow-100 text-yellow-800", label: "Medium Care" };
      case "high":
        return { color: "bg-orange-100 text-orange-800", label: "High Care" };
      case "critical":
        return { color: "bg-red-100 text-red-800", label: "Critical Care" };
      default:
        return { color: "bg-slate-100 text-slate-800", label: "Unknown" };
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-32 mb-4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
            <div>
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "care_giver") {
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
        {/* Back Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/caregiver/patients")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to My Patients</span>
          </Button>
        </div>

        {/* Patient Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-slate-200 p-4 rounded-full">
                <User className="h-8 w-8 text-slate-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {patient.name}
                </h1>
                <p className="text-slate-600">
                  {patient.age} years • {patient.gender}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={getStatusColor(patient.status)}>
                    {patient.status}
                  </Badge>
                  <Badge className={careLevel.color}>{careLevel.label}</Badge>
                </div>
                {/* Contact Information */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Phone className="h-3 w-3" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-slate-600">
                    <MapPin className="h-3 w-3 mt-0.5" />
                    <span>{patient.address}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Emergency: {patient.emergencyContact.name} (
                    {patient.emergencyContact.relationship}) -{" "}
                    {patient.emergencyContact.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-600">Last Visit</p>
              <p className="font-medium">{formatDateOnly(patient.lastVisit)}</p>
              <p className="text-sm text-slate-600 mt-2">Next Visit</p>
              <p className="font-medium">{formatDateOnly(patient.nextVisit)}</p>
            </div>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="notes">Care Notes</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
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
                      <span className="text-slate-600">Oxygen Sat:</span>
                      <span className="font-medium">
                        {patient.vitals.oxygenSaturation}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      <strong>Recorded:</strong>{" "}
                      {formatDateTime(patient.vitals.recordedDate).fullDate} at{" "}
                      {formatDateTime(patient.vitals.recordedDate).time}
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

                {/* Risk Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span>Risk Factors</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {patient.riskFactors.map((risk, index) => (
                        <Badge
                          key={index}
                          variant="destructive"
                          className="mr-2 mb-2"
                        >
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Allergies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span>Allergies</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddingAllergy(true)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Allergy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Add Allergy Form */}
                      {isAddingAllergy && (
                        <div className="border rounded-lg p-3 bg-slate-50">
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Enter allergy (e.g., Penicillin, Peanuts)"
                              value={newAllergy}
                              onChange={(e) => setNewAllergy(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={handleAddAllergy}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsAddingAllergy(false);
                                setNewAllergy("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Existing Allergies */}
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.length > 0 ? (
                          patient.allergies.map((allergy, index) => (
                            <Badge
                              key={index}
                              className="bg-red-100 text-red-800"
                            >
                              {allergy}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-slate-500">No known allergies</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <span>Recent Care Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{patient.notes}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comprehensive Vitals Tab */}
            <TabsContent value="vitals" className="space-y-6">
              {/* Quick Entry Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-teal-600" />
                    <span>Record New Vital Signs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="systolic">
                        Blood Pressure (Systolic)
                      </Label>
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        value={quickVitals.bloodPressureSystolic}
                        onChange={(e) =>
                          setQuickVitals({
                            ...quickVitals,
                            bloodPressureSystolic: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="diastolic">
                        Blood Pressure (Diastolic)
                      </Label>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        value={quickVitals.bloodPressureDiastolic}
                        onChange={(e) =>
                          setQuickVitals({
                            ...quickVitals,
                            bloodPressureDiastolic: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                      <Input
                        id="heartRate"
                        type="number"
                        placeholder="72"
                        value={quickVitals.heartRate}
                        onChange={(e) =>
                          setQuickVitals({
                            ...quickVitals,
                            heartRate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        placeholder="36.5"
                        value={quickVitals.temperature}
                        onChange={(e) =>
                          setQuickVitals({
                            ...quickVitals,
                            temperature: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="oxygen">Oxygen Saturation (%)</Label>
                      <Input
                        id="oxygen"
                        type="number"
                        placeholder="98"
                        value={quickVitals.oxygenSaturation}
                        onChange={(e) =>
                          setQuickVitals({
                            ...quickVitals,
                            oxygenSaturation: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="respiratory">
                        Respiratory Rate (breaths/min)
                      </Label>
                      <Input
                        id="respiratory"
                        type="number"
                        placeholder="16"
                        value={quickVitals.respiratoryRate}
                        onChange={(e) =>
                          setQuickVitals({
                            ...quickVitals,
                            respiratoryRate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Extended Vitals Section */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-slate-700 mb-3">
                      Extended Vitals (Optional)
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bloodGlucose">
                          Blood Glucose (mg/dL)
                        </Label>
                        <Input
                          id="bloodGlucose"
                          type="number"
                          placeholder="95"
                          value={quickVitals.bloodGlucose}
                          onChange={(e) =>
                            setQuickVitals({
                              ...quickVitals,
                              bloodGlucose: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          placeholder="70"
                          value={quickVitals.weight}
                          onChange={(e) =>
                            setQuickVitals({
                              ...quickVitals,
                              weight: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="170"
                          value={quickVitals.height}
                          onChange={(e) =>
                            setQuickVitals({
                              ...quickVitals,
                              height: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="painLevel">Pain Level (1-10)</Label>
                        <Input
                          id="painLevel"
                          type="number"
                          min="1"
                          max="10"
                          placeholder="1"
                          value={quickVitals.painLevel}
                          onChange={(e) =>
                            setQuickVitals({
                              ...quickVitals,
                              painLevel: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleQuickVitalsSubmit} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Record Vital Signs
                  </Button>
                </CardContent>
              </Card>

              {/* Vitals History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Vital Signs History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingData ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : vitalRecords.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date & Time</TableHead>
                              <TableHead>Blood Pressure</TableHead>
                              <TableHead>Heart Rate</TableHead>
                              <TableHead>Temperature</TableHead>
                              <TableHead>Oxygen Sat</TableHead>
                              <TableHead>Respiratory Rate</TableHead>
                              <TableHead>Blood Glucose</TableHead>
                              <TableHead>Weight</TableHead>
                              <TableHead>BMI</TableHead>
                              <TableHead>Pain Level</TableHead>
                              <TableHead>Recorded By</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPaginatedData(
                              vitalRecords,
                              vitalsPage
                            ).data.map((vital) => (
                              <TableRow key={vital.id}>
                                <TableCell className="font-medium text-center">
                                  <div>
                                    {
                                      formatDateTime(vital.recordedDate)
                                        .fullDate
                                    }
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {formatDateTime(vital.recordedDate).time}
                                  </div>
                                </TableCell>
                                <TableCell>{vital.bloodPressure}</TableCell>
                                <TableCell>{vital.heartRate} bpm</TableCell>
                                <TableCell>{vital.temperature}°C</TableCell>
                                <TableCell>{vital.oxygenSaturation}%</TableCell>
                                <TableCell>
                                  {vital.respiratoryRate} /min
                                </TableCell>
                                <TableCell>
                                  {vital.bloodGlucose
                                    ? `${vital.bloodGlucose} mg/dL`
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  {vital.weight ? `${vital.weight} kg` : "-"}
                                </TableCell>
                                <TableCell>
                                  {vital.bmi ? vital.bmi : "-"}
                                </TableCell>
                                <TableCell>
                                  {vital.painLevel
                                    ? `${vital.painLevel}/10`
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {vital.recordedBy}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <PaginationControls
                        currentPage={vitalsPage}
                        totalPages={
                          getPaginatedData(vitalRecords, vitalsPage).totalPages
                        }
                        onPageChange={setVitalsPage}
                        hasNext={
                          getPaginatedData(vitalRecords, vitalsPage).hasNext
                        }
                        hasPrev={
                          getPaginatedData(vitalRecords, vitalsPage).hasPrev
                        }
                      />
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>No vital signs recorded yet</p>
                      <p className="text-sm">
                        Use the form above to record the first vital signs
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comprehensive Medications Tab */}
            <TabsContent value="medications" className="space-y-6">
              {/* Prescribed Medications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Pill className="h-5 w-5 text-blue-500" />
                    <span>Prescribed Medications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingData ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  ) : prescribedMedications.length > 0 ? (
                    <div className="space-y-4">
                      {prescribedMedications.map((prescription) => (
                        <div
                          key={prescription.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-lg">
                                {prescription.medicationName}
                              </h4>
                              <p className="text-sm text-slate-600">
                                {prescription.dosage} • {prescription.frequency}
                              </p>
                              <p className="text-xs text-slate-500">
                                Prescribed by {prescription.prescribedBy} on{" "}
                                {formatDateOnly(prescription.prescribedDate)}
                              </p>
                            </div>
                            <Badge
                              className={
                                prescription.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {prescription.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-700 bg-blue-50 p-2 rounded mb-3">
                            <strong>Instructions:</strong>{" "}
                            {prescription.instructions}
                          </div>

                          {/* Scheduled Administrations for this prescription */}
                          <div className="mt-4">
                            <h5 className="font-medium text-sm mb-2">
                              Scheduled Administrations:
                            </h5>
                            <div className="space-y-2">
                              {medicationAdministrations
                                .filter(
                                  (admin) =>
                                    admin.prescriptionId === prescription.id
                                )
                                .sort(
                                  (a, b) =>
                                    new Date(b.scheduledTime).getTime() -
                                    new Date(a.scheduledTime).getTime()
                                )
                                .slice(0, 3) // Show last 3 administrations
                                .map((administration) => (
                                  <div
                                    key={administration.id}
                                    className="flex items-center justify-between p-2 bg-slate-50 rounded"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <Clock className="h-3 w-3 text-slate-500" />
                                      <span className="text-sm">
                                        {formatCompactDateTime(
                                          administration.scheduledTime
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge
                                        className={
                                          administration.status ===
                                          "administered"
                                            ? "bg-green-100 text-green-800"
                                            : administration.status ===
                                              "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : administration.status === "missed"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                        }
                                      >
                                        {administration.status}
                                      </Badge>
                                      {administration.status === "pending" && (
                                        <div className="flex space-x-1">
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              openConfirmationDialog(
                                                administration.id,
                                                "administered"
                                              )
                                            }
                                            className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                                          >
                                            ✓ Given
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              openConfirmationDialog(
                                                administration.id,
                                                "missed"
                                              )
                                            }
                                            className="h-6 px-2 text-xs"
                                          >
                                            Missed
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              openConfirmationDialog(
                                                administration.id,
                                                "refused"
                                              )
                                            }
                                            className="h-6 px-2 text-xs"
                                          >
                                            Refused
                                          </Button>
                                        </div>
                                      )}
                                      {administration.status ===
                                        "administered" &&
                                        administration.administeredBy && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {administration.administeredBy}
                                          </Badge>
                                        )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Pill className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>No medications prescribed yet</p>
                      <p className="text-sm">
                        Medications will appear here when prescribed by a
                        reviewer
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Administration History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    <span>Administration History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingData ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : medicationAdministrations.filter(
                      (admin) => admin.status !== "pending"
                    ).length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medication</TableHead>
                              <TableHead>Scheduled Time</TableHead>
                              <TableHead>Administered Time</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Administered By</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPaginatedData(
                              medicationAdministrations
                                .filter((admin) => admin.status !== "pending")
                                .sort(
                                  (a, b) =>
                                    new Date(b.scheduledTime).getTime() -
                                    new Date(a.scheduledTime).getTime()
                                ),
                              medicationsPage
                            ).data.map((administration) => {
                              const prescription = prescribedMedications.find(
                                (p) => p.id === administration.prescriptionId
                              );
                              return (
                                <TableRow key={administration.id}>
                                  <TableCell className="font-medium">
                                    {prescription?.medicationName} (
                                    {prescription?.dosage})
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {formatCompactDateTime(
                                      administration.scheduledTime
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {administration.administeredTime
                                      ? formatCompactDateTime(
                                          administration.administeredTime
                                        )
                                      : "-"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        administration.status === "administered"
                                          ? "bg-green-100 text-green-800"
                                          : administration.status === "missed"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                      }
                                    >
                                      {administration.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {administration.administeredBy ? (
                                      <Badge variant="outline">
                                        {administration.administeredBy}
                                      </Badge>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="max-w-xs">
                                    {administration.notes ? (
                                      <span className="text-sm text-slate-600">
                                        {administration.notes}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      <PaginationControls
                        currentPage={medicationsPage}
                        totalPages={
                          getPaginatedData(
                            medicationAdministrations.filter(
                              (admin) => admin.status !== "pending"
                            ),
                            medicationsPage
                          ).totalPages
                        }
                        onPageChange={setMedicationsPage}
                        hasNext={
                          getPaginatedData(
                            medicationAdministrations.filter(
                              (admin) => admin.status !== "pending"
                            ),
                            medicationsPage
                          ).hasNext
                        }
                        hasPrev={
                          getPaginatedData(
                            medicationAdministrations.filter(
                              (admin) => admin.status !== "pending"
                            ),
                            medicationsPage
                          ).hasPrev
                        }
                      />
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>No administration history yet</p>
                      <p className="text-sm">
                        History will appear as medications are administered
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comprehensive Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              {/* Quick Entry Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-teal-600" />
                    <span>Add Care Note</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="noteType">Note Type</Label>
                      <select
                        id="noteType"
                        className="w-full p-2 border border-slate-300 rounded-md"
                        value={quickNote.type}
                        onChange={(e) =>
                          setQuickNote({
                            ...quickNote,
                            type: e.target.value as any,
                          })
                        }
                      >
                        <option value="general">General Care</option>
                        <option value="medication">Medication Related</option>
                        <option value="vitals">Vitals Related</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        className="w-full p-2 border border-slate-300 rounded-md"
                        value={quickNote.priority}
                        onChange={(e) =>
                          setQuickNote({
                            ...quickNote,
                            priority: e.target.value as any,
                          })
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="noteContent">Care Note</Label>
                    <Textarea
                      id="noteContent"
                      placeholder="Enter your care note here..."
                      rows={4}
                      value={quickNote.content}
                      onChange={(e) =>
                        setQuickNote({
                          ...quickNote,
                          content: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleQuickNoteSubmit} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Add Care Note
                  </Button>
                </CardContent>
              </Card>

              {/* Notes History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <span>Care Notes History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingData ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  ) : careNotes.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {getPaginatedData(careNotes, notesPage).data.map(
                          (note) => (
                            <div
                              key={note.id}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-slate-500" />
                                  <div className="text-sm font-medium text-center">
                                    <div>
                                      {
                                        formatDateTime(note.createdDate)
                                          .fullDate
                                      }
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {formatDateTime(note.createdDate).time}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    className={
                                      note.priority === "high"
                                        ? "bg-red-100 text-red-800"
                                        : note.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                    }
                                  >
                                    {note.priority} priority
                                  </Badge>
                                  <Badge variant="outline">{note.type}</Badge>
                                  <Badge variant="outline">
                                    {note.createdBy}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-slate-700">
                                {note.content}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                      <PaginationControls
                        currentPage={notesPage}
                        totalPages={
                          getPaginatedData(careNotes, notesPage).totalPages
                        }
                        onPageChange={setNotesPage}
                        hasNext={getPaginatedData(careNotes, notesPage).hasNext}
                        hasPrev={getPaginatedData(careNotes, notesPage).hasPrev}
                      />
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>No care notes recorded yet</p>
                      <p className="text-sm">
                        Use the form above to add the first care note
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    <span>Complete Care History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingData ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : (
                    (() => {
                      const allHistory = [
                        ...vitalRecords.map((v) => ({
                          ...v,
                          type: "vital",
                          date: v.recordedDate,
                        })),
                        ...medicationAdministrations
                          .filter((admin) => admin.status !== "pending")
                          .map((m) => {
                            const prescription = prescribedMedications.find(
                              (p) => p.id === m.prescriptionId
                            );
                            return {
                              ...m,
                              type: "medication",
                              date: m.administeredTime || m.scheduledTime,
                              medicationName: prescription?.medicationName,
                              dosage: prescription?.dosage,
                            };
                          }),
                        ...careNotes.map((n) => ({
                          ...n,
                          type: "note",
                          date: n.createdDate,
                        })),
                      ];

                      const sortedHistory = allHistory.sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      );

                      if (sortedHistory.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-500">
                            <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p>No care history available yet</p>
                            <p className="text-sm">
                              Start recording vitals, medications, or notes to
                              build the history
                            </p>
                          </div>
                        );
                      }

                      return (
                        <>
                          <div className="space-y-4">
                            {getPaginatedData(
                              sortedHistory,
                              historyPage
                            ).data.map((item) => (
                              <div
                                key={`${item.type}-${item.id}`}
                                className="border rounded-lg p-4"
                              >
                                <div className="flex items-center space-x-2 mb-2">
                                  {item.type === "vital" && (
                                    <Heart className="h-4 w-4 text-red-500" />
                                  )}
                                  {item.type === "medication" && (
                                    <Pill className="h-4 w-4 text-blue-500" />
                                  )}
                                  {item.type === "note" && (
                                    <FileText className="h-4 w-4 text-green-500" />
                                  )}
                                  <div className="text-sm font-medium text-center">
                                    <div>
                                      {formatDateTime(item.date).fullDate}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {formatDateTime(item.date).time}
                                    </div>
                                  </div>
                                  <Badge variant="outline">
                                    {item.type === "vital"
                                      ? "Vital Signs"
                                      : item.type === "medication"
                                      ? "Medication"
                                      : "Care Note"}
                                  </Badge>
                                </div>
                                <div className="text-sm text-slate-700">
                                  {item.type === "vital" &&
                                    `BP: ${(item as any).bloodPressure}, HR: ${
                                      (item as any).heartRate
                                    } bpm`}
                                  {item.type === "medication" &&
                                    `${(item as any).medicationName} - ${
                                      (item as any).dosage
                                    } (${(item as any).status})`}
                                  {item.type === "note" &&
                                    (item as any).content}
                                </div>
                              </div>
                            ))}
                          </div>
                          <PaginationControls
                            currentPage={historyPage}
                            totalPages={
                              getPaginatedData(sortedHistory, historyPage)
                                .totalPages
                            }
                            onPageChange={setHistoryPage}
                            hasNext={
                              getPaginatedData(sortedHistory, historyPage)
                                .hasNext
                            }
                            hasPrev={
                              getPaginatedData(sortedHistory, historyPage)
                                .hasPrev
                            }
                          />
                        </>
                      );
                    })()
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Medication Confirmation Dialog */}
        <Dialog
          open={confirmationDialog.isOpen}
          onOpenChange={(open) =>
            !open &&
            setConfirmationDialog({
              isOpen: false,
              administrationId: "",
              action: "administered",
              medicationName: "",
            })
          }
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Medication Action</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to mark{" "}
                <strong>{confirmationDialog.medicationName}</strong> as{" "}
                <strong>{confirmationDialog.action}</strong>?
              </p>
              <div className="flex space-x-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    setConfirmationDialog({
                      isOpen: false,
                      administrationId: "",
                      action: "administered",
                      medicationName: "",
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleMedicationAdministration(
                      confirmationDialog.administrationId,
                      confirmationDialog.action
                    )
                  }
                  className={
                    confirmationDialog.action === "administered"
                      ? "bg-green-600 hover:bg-green-700"
                      : confirmationDialog.action === "missed"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                >
                  Confirm{" "}
                  {confirmationDialog.action === "administered"
                    ? "Given"
                    : confirmationDialog.action}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
