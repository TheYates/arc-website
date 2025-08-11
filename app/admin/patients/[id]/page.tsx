"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth, hasPermission } from "@/lib/auth";
import { getPatientById } from "@/lib/api/patients";
import {
  getAvailableStaff,
  assignPatientToCaregiver,
  assignPatientToReviewer,
  removeAssignment,
  getWorkloadStats,
} from "@/lib/api/assignments";
import { Patient, CareLevel, PatientStatus } from "@/lib/types/patients";
import { User } from "@/lib/auth";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Heart,
  Stethoscope,
  FileText,
  Clock,
  Users,
  Shield,
  Loader2,
  UserPlus,
  Edit,
  Eye,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AdminPatientMobile } from "@/components/mobile/admin-patient-detail";

export default function AdminPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<{
    caregivers: User[];
    reviewers: User[];
  }>({ caregivers: [], reviewers: [] });
  const [workloadStats, setWorkloadStats] = useState<{
    caregivers: Array<{ user: User; patientCount: number }>;
    reviewers: Array<{ user: User; patientCount: number }>;
  }>({ caregivers: [], reviewers: [] });
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>("");
  const [selectedReviewer, setSelectedReviewer] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  // Authentication is handled by admin layout - no need for individual checks

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [patientData, staffData, statsData] = await Promise.all([
          getPatientById(id),
          getAvailableStaff(),
          getWorkloadStats(),
        ]);
        setPatient(patientData);
        setAvailableStaff(staffData);
        setWorkloadStats(statsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const getCareLevelBadge = (careLevel?: CareLevel) => {
    switch (careLevel) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      case "medium":
        return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
      case "high":
        return <Badge className="bg-amber-100 text-amber-800">High</Badge>;
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusBadge = (status?: PatientStatus) => {
    switch (status) {
      case "stable":
        return <Badge className="bg-green-100 text-green-800">Stable</Badge>;
      case "improving":
        return <Badge className="bg-teal-100 text-teal-800">Improving</Badge>;
      case "declining":
        return <Badge className="bg-amber-100 text-amber-800">Declining</Badge>;
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleOpenAssignmentDialog = () => {
    if (!patient) return;
    // Initialize selections with current assignments, ensuring the values persist
    setSelectedCaregiver(patient.assignedCaregiverId || "none");
    setSelectedReviewer(patient.assignedReviewerId || "none");
    setShowAssignmentDialog(true);
  };

  const handleAssignment = async () => {
    if (!patient || !user) return;

    setIsAssigning(true);
    try {
      let success = true;

      // Handle caregiver assignment
      if (
        selectedCaregiver &&
        selectedCaregiver !== "none" &&
        selectedCaregiver !== patient.assignedCaregiverId
      ) {
        success = await assignPatientToCaregiver(
          patient.id,
          selectedCaregiver,
          user.id
        );
        if (!success) throw new Error("Failed to assign caregiver");
      } else if (
        (selectedCaregiver === "none" || !selectedCaregiver) &&
        patient.assignedCaregiverId
      ) {
        success = await removeAssignment(patient.id, "caregiver");
        if (!success) throw new Error("Failed to remove caregiver assignment");
      }

      // Handle reviewer assignment
      if (
        selectedReviewer &&
        selectedReviewer !== "none" &&
        selectedReviewer !== patient.assignedReviewerId
      ) {
        success = await assignPatientToReviewer(
          patient.id,
          selectedReviewer,
          user.id
        );
        if (!success) throw new Error("Failed to assign reviewer");
      } else if (
        (selectedReviewer === "none" || !selectedReviewer) &&
        patient.assignedReviewerId
      ) {
        success = await removeAssignment(patient.id, "reviewer");
        if (!success) throw new Error("Failed to remove reviewer assignment");
      }

      // Refresh patient data
      const updatedPatient = await getPatientById(id);
      setPatient(updatedPatient);

      setShowAssignmentDialog(false);
      toast({
        title: "Assignment Updated",
        description: `Patient assignments have been updated successfully.`,
      });
    } catch (error) {
      console.error("Assignment error:", error);
      toast({
        title: "Assignment Failed",
        description: "Failed to update patient assignments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading patient information...
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold mb-2">Patient Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested patient could not be found.
          </p>
          <Button onClick={() => router.push("/admin/patients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <AdminPatientMobile patientId={id} />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div className="space-y-4">
          {/* Back Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/patients")}
            className="w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>

          {/* Patient Info and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-muted-foreground">
                Patient Details & Management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignmentDialog(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Care Team
              </Button>
              {getCareLevelBadge(patient.careLevel)}
              {getStatusBadge(patient.status)}
            </div>
          </div>
        </div>

        {/* Assignment Alert */}
        {(!patient.assignedCaregiver || !patient.assignedReviewer) && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="font-medium mb-1">Assignment Required</div>
              <div className="text-sm">
                {!patient.assignedCaregiver && !patient.assignedReviewer
                  ? "This patient needs both a caregiver and reviewer assigned."
                  : !patient.assignedCaregiver
                  ? "This patient needs a caregiver assigned."
                  : "This patient needs a reviewer assigned."}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Patient Information
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <p className="text-base font-medium">
                      {patient.firstName} {patient.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Medical Record #
                    </label>
                    <p className="text-base font-mono">
                      {patient.medicalRecordNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </label>
                    <p className="text-base">
                      {formatDate(patient.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Service
                    </label>
                    <p className="text-base">{patient.serviceName || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <p className="text-base">{patient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone
                      </label>
                      <p className="text-base">{patient.phone}</p>
                    </div>
                  </div>
                </div>
                {patient.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Address
                      </label>
                      <p className="text-base">{patient.address}</p>
                    </div>
                  </div>
                )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Care Level
                    </label>
                    <div className="mt-1">
                      {getCareLevelBadge(patient.careLevel)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Current Status
                    </label>
                    <div className="mt-1">{getStatusBadge(patient.status)}</div>
                  </div>
                </div>

                {/* Note: Medical history, medications, and allergies would be shown here if available */}
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Additional medical information can be added through the edit
                  function.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Care Team
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenAssignmentDialog}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.assignedCaregiver && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          Caregiver
                        </p>
                        <p className="text-sm text-green-700">
                          {patient.assignedCaregiver.name}
                        </p>
                        <p className="text-xs text-green-600">
                          Assigned{" "}
                          {formatDate(patient.assignedCaregiver.assignedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {patient.assignedReviewer && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-purple-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">
                          Medical Reviewer
                        </p>
                        <p className="text-sm text-purple-700">
                          {patient.assignedReviewer.name}
                        </p>
                        <p className="text-xs text-purple-600">
                          Assigned{" "}
                          {formatDate(patient.assignedReviewer.assignedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!patient.assignedCaregiver && !patient.assignedReviewer && (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No care team assigned
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleOpenAssignmentDialog}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Staff
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Patient Information
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={handleOpenAssignmentDialog}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Care Team
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Medical Records
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      // Navigate to appropriate role-specific view based on assignment
                      if (patient.assignedReviewerId) {
                        router.push(`/reviewer/patients/${patient.id}`);
                      } else if (patient.assignedCaregiverId) {
                        router.push(`/caregiver/patients/${patient.id}`);
                      } else {
                        toast({
                          title: "No Staff Assigned",
                          description:
                            "Please assign a caregiver or reviewer first.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View as Staff
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">
                        Patient assigned to care team
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(patient.assignedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">
                        Patient record created
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(patient.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Dialog */}
          <Dialog
            open={showAssignmentDialog}
            onOpenChange={setShowAssignmentDialog}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Manage Care Team
                </DialogTitle>
                <DialogDescription>
                  Assign {patient?.firstName} {patient?.lastName} to available
                  staff members
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Current Assignment Status */}
                {patient &&
                  (patient.assignedCaregiver || patient.assignedReviewer) && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-900 mb-2">
                        Current Assignments:
                      </div>
                      <div className="space-y-1 text-xs text-blue-700">
                        {patient.assignedCaregiver && (
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            <span>
                              Caregiver: {patient.assignedCaregiver.name}
                            </span>
                          </div>
                        )}
                        {patient.assignedReviewer && (
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            <span>
                              Reviewer: {patient.assignedReviewer.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Caregiver Selection */}
                <div className="space-y-2">
                  <Label htmlFor="caregiver">Caregiver</Label>
                  <Select
                    value={selectedCaregiver}
                    onValueChange={setSelectedCaregiver}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a caregiver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Assignment</SelectItem>
                      {availableStaff.caregivers.map((caregiver) => {
                        const workload =
                          workloadStats.caregivers.find(
                            (w) => w.user.id === caregiver.id
                          )?.patientCount || 0;
                        return (
                          <SelectItem key={caregiver.id} value={caregiver.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {caregiver.firstName} {caregiver.lastName}
                              </span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {workload}/5 patients
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reviewer Selection */}
                <div className="space-y-2">
                  <Label htmlFor="reviewer">Reviewer</Label>
                  <Select
                    value={selectedReviewer}
                    onValueChange={setSelectedReviewer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Assignment</SelectItem>
                      {availableStaff.reviewers.map((reviewer) => {
                        const workload =
                          workloadStats.reviewers.find(
                            (w) => w.user.id === reviewer.id
                          )?.patientCount || 0;
                        return (
                          <SelectItem key={reviewer.id} value={reviewer.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {reviewer.firstName} {reviewer.lastName}
                              </span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {workload}/5 patients
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAssignmentDialog(false)}
                  disabled={isAssigning}
                >
                  Cancel
                </Button>
                <Button onClick={handleAssignment} disabled={isAssigning}>
                  {isAssigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Update Assignments
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
