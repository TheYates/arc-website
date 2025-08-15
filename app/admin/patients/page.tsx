"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { getPatients } from "@/lib/api/patients";
import { Patient, CareLevel, PatientStatus } from "@/lib/types/patients";
import {
  getAvailableStaff,
  assignPatientToCaregiver,
  assignPatientToReviewer,
  removeAssignment,
  getWorkloadStats,
} from "@/lib/api/assignments";
import { User } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import {
  Loader2,
  Search,
  Calendar,
  UserPlus,
  Users,
  Eye,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  X,
} from "lucide-react";
import { AdminPatientsMobile } from "@/components/mobile/admin-patients";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
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
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [patientsData, staffData, statsData] = await Promise.all([
          getPatients(),
          getAvailableStaff(),
          getWorkloadStats(),
        ]);
        setPatients(patientsData);
        setAvailableStaff(staffData);
        setWorkloadStats(statsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const filteredPatients = patients.filter((patient) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      searchTerm === "" ||
      patient.firstName.toLowerCase().includes(searchTermLower) ||
      patient.lastName.toLowerCase().includes(searchTermLower) ||
      patient.email.toLowerCase().includes(searchTermLower) ||
      (patient.medicalRecordNumber &&
        patient.medicalRecordNumber.toLowerCase().includes(searchTermLower))
    );
  });

  const handleOpenAssignmentDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedCaregiver(patient.assignedCaregiverId || "none");
    setSelectedReviewer(patient.assignedReviewerId || "none");
    setShowAssignmentDialog(true);
  };

  const handleAssignment = async () => {
    if (!selectedPatient || !user) return;

    setIsAssigning(true);
    try {
      let success = true;

      // Handle caregiver assignment
      if (
        selectedCaregiver &&
        selectedCaregiver !== "none" &&
        selectedCaregiver !== selectedPatient.assignedCaregiverId
      ) {
        success = await assignPatientToCaregiver(
          selectedPatient.id,
          selectedCaregiver,
          user.id
        );
        if (!success) throw new Error("Failed to assign caregiver");
      } else if (
        (selectedCaregiver === "none" || !selectedCaregiver) &&
        selectedPatient.assignedCaregiverId
      ) {
        success = await removeAssignment(selectedPatient.id, "caregiver");
        if (!success) throw new Error("Failed to remove caregiver assignment");
      }

      // Handle reviewer assignment
      if (
        selectedReviewer &&
        selectedReviewer !== "none" &&
        selectedReviewer !== selectedPatient.assignedReviewerId
      ) {
        success = await assignPatientToReviewer(
          selectedPatient.id,
          selectedReviewer,
          user.id
        );
        if (!success) throw new Error("Failed to assign reviewer");
      } else if (
        (selectedReviewer === "none" || !selectedReviewer) &&
        selectedPatient.assignedReviewerId
      ) {
        success = await removeAssignment(selectedPatient.id, "reviewer");
        if (!success) throw new Error("Failed to remove reviewer assignment");
      }

      // Refresh data
      const [patientsData, staffData, statsData] = await Promise.all([
        getPatients(),
        getAvailableStaff(),
        getWorkloadStats(),
      ]);
      setPatients(patientsData);
      setAvailableStaff(staffData);
      setWorkloadStats(statsData);

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

  const handleRemoveAssignment = async (patient: Patient) => {
    if (!user) return;

    setIsAssigning(true);
    try {
      let success = true;

      // Remove caregiver assignment
      if (patient.assignedCaregiverId) {
        success = await removeAssignment(patient.id, "caregiver");
        if (!success) throw new Error("Failed to remove caregiver assignment");
      }

      // Remove reviewer assignment
      if (patient.assignedReviewerId) {
        success = await removeAssignment(patient.id, "reviewer");
        if (!success) throw new Error("Failed to remove reviewer assignment");
      }

      // Refresh data
      const [patientsData, staffData, statsData] = await Promise.all([
        getPatients(),
        getAvailableStaff(),
        getWorkloadStats(),
      ]);
      setPatients(patientsData);
      setAvailableStaff(staffData);
      setWorkloadStats(statsData);

      toast({
        title: "Assignment Removed",
        description: `Patient assignments have been removed successfully.`,
      });
    } catch (error) {
      console.error("Remove assignment error:", error);
      toast({
        title: "Remove Assignment Failed",
        description: "Failed to remove patient assignments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const formatAssignedDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return formatDate(date);
  };

  return (
    <div className="space-y-6">
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <AdminPatientsMobile />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
            <p className="text-muted-foreground">
              View and manage all registered patients
            </p>
          </div>
          {/* Removed Add From Applications per new flow: approved apps auto-create patients */}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <CardTitle>All Patients</CardTitle>
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-muted-foreground">No patients found</div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/admin/applications")}
                >
                  Review Applications
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Medical Record #</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Care Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Assignments</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow
                        key={patient.id}
                        role="link"
                        tabIndex={0}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() =>
                          router.push(`/admin/patients/${patient.id}`)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push(`/admin/patients/${patient.id}`);
                          }
                        }}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {patient.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {patient.medicalRecordNumber || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>{patient.serviceName || "N/A"}</TableCell>
                        <TableCell>
                          {getCareLevelBadge(patient.careLevel)}
                        </TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatAssignedDate(patient.assignedDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col space-y-1">
                            {patient.assignedCaregiver && (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                <span className="text-xs font-medium text-green-600">
                                  CG: {patient.assignedCaregiver.name}
                                </span>
                              </div>
                            )}
                            {patient.assignedReviewer && (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                <span className="text-xs font-medium text-purple-600">
                                  RV: {patient.assignedReviewer.name}
                                </span>
                              </div>
                            )}
                            {!patient.assignedCaregiver &&
                              !patient.assignedReviewer && (
                                <Badge variant="outline" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Unassigned
                                </Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenAssignmentDialog(patient)
                              }
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              {patient.assignedCaregiver ||
                              patient.assignedReviewer
                                ? "Manage"
                                : "Assign"}
                            </Button>
                            {(patient.assignedCaregiver ||
                              patient.assignedReviewer) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveAssignment(patient)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Dialog */}
        <Dialog
          open={showAssignmentDialog}
          onOpenChange={setShowAssignmentDialog}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Assign Patient
              </DialogTitle>
              <DialogDescription>
                Assign {selectedPatient?.firstName} {selectedPatient?.lastName}{" "}
                to available staff members
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Current Assignment Status */}
              {selectedPatient &&
                (selectedPatient.assignedCaregiver ||
                  selectedPatient.assignedReviewer) && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-900 mb-2">
                      Current Assignments:
                    </div>
                    <div className="space-y-1 text-xs text-blue-700">
                      {selectedPatient.assignedCaregiver && (
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>
                            Caregiver: {selectedPatient.assignedCaregiver.name}
                          </span>
                        </div>
                      )}
                      {selectedPatient.assignedReviewer && (
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>
                            Reviewer: {selectedPatient.assignedReviewer.name}
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
                    {/* Show current caregiver even if at capacity */}
                    {selectedPatient?.assignedCaregiver &&
                      !availableStaff.caregivers.find(
                        (c) => c.id === selectedPatient.assignedCaregiverId
                      ) && (
                        <SelectItem
                          value={selectedPatient.assignedCaregiverId!}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>
                              {selectedPatient.assignedCaregiver.name}
                            </span>
                            <Badge
                              variant="destructive"
                              className="ml-2 text-xs"
                            >
                              At Capacity
                            </Badge>
                          </div>
                        </SelectItem>
                      )}
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
                    {/* Show current reviewer even if at capacity */}
                    {selectedPatient?.assignedReviewer &&
                      !availableStaff.reviewers.find(
                        (r) => r.id === selectedPatient.assignedReviewerId
                      ) && (
                        <SelectItem value={selectedPatient.assignedReviewerId!}>
                          <div className="flex items-center justify-between w-full">
                            <span>{selectedPatient.assignedReviewer.name}</span>
                            <Badge
                              variant="destructive"
                              className="ml-2 text-xs"
                            >
                              At Capacity
                            </Badge>
                          </div>
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>

              {/* Workload Warning */}
              {(selectedCaregiver &&
                availableStaff.caregivers.find(
                  (c) =>
                    c.id === selectedCaregiver &&
                    (workloadStats.caregivers.find((w) => w.user.id === c.id)
                      ?.patientCount || 0) >= 4
                )) ||
              (selectedReviewer &&
                availableStaff.reviewers.find(
                  (r) =>
                    r.id === selectedReviewer &&
                    (workloadStats.reviewers.find((w) => w.user.id === r.id)
                      ?.patientCount || 0) >= 4
                )) ? (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-sm text-amber-700">
                      Selected staff member is approaching maximum capacity (5
                      patients).
                    </span>
                  </div>
                </div>
              ) : null}
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
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Assignments
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
