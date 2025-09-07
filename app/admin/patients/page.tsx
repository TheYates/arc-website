"use client";

import { useState, useEffect, useMemo, lazy, Suspense } from "react";
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
import { Patient, CareLevel, PatientStatus } from "@/lib/types/patients";
import { User } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import {
  Loader2,
  Search,
  UserPlus,
  Eye,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// Custom hook for optimized patient data fetching
import { useOptimizedPatientManagement, usePatientMutations } from "@/hooks/use-admin-queries";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>("");
  const [selectedReviewer, setSelectedReviewer] = useState<string>("");

  // Performance monitoring
  const [loadStartTime] = useState(() => Date.now());
  const [loadTime, setLoadTime] = useState<number | null>(null);

  const router = useRouter();

  const { patients, availableStaff, isLoading, error, refetchAll, loadTime: dataLoadTime } = useOptimizedPatientManagement(1, 50);
  const { assignCaregiver, assignReviewer, isAssigningCaregiver, isAssigningReviewer } = usePatientMutations();

  // Track total load time when data is ready
  useEffect(() => {
    if (!isLoading && dataLoadTime && !loadTime) {
      const totalTime = Date.now() - loadStartTime;
      setLoadTime(totalTime);
      console.log(`⚡ Patients page loaded in ${totalTime}ms (API: ${dataLoadTime}ms)`);
    }
  }, [isLoading, dataLoadTime, loadTime, loadStartTime]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredPatients = useMemo(() => {
    if (!debouncedSearchTerm) return patients;
    return patients.filter(
      (patient: any) =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [patients, debouncedSearchTerm]);

  const handleAssignCaregiver = async () => {
    if (!selectedPatient || !selectedCaregiver) return;
    await assignCaregiver.mutateAsync({
      patientId: selectedPatient.id,
      caregiverId: selectedCaregiver,
    });
    setSelectedCaregiver("");
    setSelectedReviewer("");
    setShowAssignmentDialog(false);
    setSelectedPatient(null);
  };

  const handleAssignReviewer = async () => {
    if (!selectedPatient || !selectedReviewer) return;
    await assignReviewer.mutateAsync({
      patientId: selectedPatient.id,
      reviewerId: selectedReviewer,
    });
    setSelectedCaregiver("");
    setSelectedReviewer("");
    setShowAssignmentDialog(false);
    setSelectedPatient(null);
  };

  const getStatusBadge = (status?: PatientStatus) => {
    if (!status) return <Badge>Unknown</Badge>;
    const statusConfig = {
      active: { label: "Active", variant: "default" as const },
      inactive: { label: "Inactive", variant: "secondary" as const },
      discharged: { label: "Discharged", variant: "outline" as const },
      stable: { label: "Stable", variant: "default" as const },
      improving: { label: "Improving", variant: "secondary" as const },
      declining: { label: "Declining", variant: "destructive" as const },
      critical: { label: "Critical", variant: "destructive" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCareLevelBadge = (level?: CareLevel) => {
    if (!level) return <Badge>Unknown</Badge>;
    const levelConfig = {
      low: { label: "Low", variant: "outline" as const },
      medium: { label: "Medium", variant: "secondary" as const },
      high: { label: "High", variant: "destructive" as const },
      critical: { label: "Critical", variant: "destructive" as const },
    };
    const config = levelConfig[level] || levelConfig.low;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load patients</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button onClick={() => refetchAll()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      <div className="hidden md:block space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">
            Manage patient assignments and care coordination
          </p>
          {loadTime && (
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${loadTime < 2000 ? 'bg-green-500' : loadTime < 5000 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${loadTime < 2000 ? 'text-green-600' : loadTime < 5000 ? 'text-yellow-600' : 'text-red-600'}`}>
                Loaded in {loadTime}ms
              </span>
            </div>
          )}
        </div>



        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Patient Directory</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing: <span className="font-medium">{filteredPatients.length}</span> of <span className="font-medium">{patients.length}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-10 w-full md:w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={() => refetchAll()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 rounded-lg border">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No patients found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "No patients found in the system."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      <TableHead className="font-semibold text-foreground">Patient</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Care Level</TableHead>
                      <TableHead className="font-semibold text-foreground">Caregiver</TableHead>
                      <TableHead className="font-semibold text-foreground">Reviewer</TableHead>
                      <TableHead className="font-semibold text-foreground">Created</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient: any) => (
                      <TableRow key={patient.id}>
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
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell>{getCareLevelBadge(patient.careLevel)}</TableCell>
                        <TableCell>
                          {patient.assignedCaregiver ? (
                            <div className="text-sm">{patient.assignedCaregiver.name}</div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.assignedReviewer ? (
                            <div className="text-sm">{patient.assignedReviewer.name}</div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(patient.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/patients/${patient.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowAssignmentDialog(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
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
      </div>

      {/* Assignment Dialog with Lazy Loading */}
      <Suspense fallback={null}>
        <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Patient</DialogTitle>
              <DialogDescription>
                Assign {selectedPatient?.firstName} {selectedPatient?.lastName} to caregivers and reviewers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caregiver">Caregiver</Label>
                <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a caregiver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff.caregivers.map((caregiver: any) => (
                      <SelectItem key={caregiver.id} value={caregiver.id}>
                        {caregiver.firstName} {caregiver.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewer">Reviewer</Label>
                <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff.reviewers.map((reviewer: any) => (
                      <SelectItem key={reviewer.id} value={reviewer.id}>
                        {reviewer.firstName} {reviewer.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
                Cancel
              </Button>
              {selectedCaregiver && (
                <Button onClick={handleAssignCaregiver} disabled={isAssigningCaregiver}>
                  {isAssigningCaregiver && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Assign Caregiver
                </Button>
              )}
              {selectedReviewer && (
                <Button onClick={handleAssignReviewer} disabled={isAssigningReviewer}>
                  {isAssigningReviewer && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Assign Reviewer
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Suspense>
    </div>
  );
}
