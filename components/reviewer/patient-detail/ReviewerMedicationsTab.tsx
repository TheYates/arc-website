"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Patient } from "@/lib/types/patients";
import { User } from "@/lib/auth";
import { Medication, MedicationAdministration } from "@/lib/types/medications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Eye,
  RefreshCw,
  Loader2,
  CheckCircle,
  Search,
  X,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { authenticatedPatch } from "@/lib/api/auth-headers";
import { toast as sonnerToast } from "sonner";
import { useToast } from "@/hooks/use-toast";

interface ReviewerMedicationsTabProps {
  patient: Patient;
  user: User;
  medications: Medication[];
  administrations: MedicationAdministration[];
  isMedicalDataLoading: boolean;
  onMedicationDataRefresh: () => Promise<void>;
  onShowPrescribeDialog: () => void;
}

export function ReviewerMedicationsTab({
  patient,
  user,
  medications,
  administrations,
  isMedicalDataLoading,
  onMedicationDataRefresh,
  onShowPrescribeDialog,
}: ReviewerMedicationsTabProps) {
  const { toast } = useToast();
  
  // Local state for this tab
  const [showAddPrescription, setShowAddPrescription] = useState(true);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<Set<string>>(new Set());
  const [showBulkCompleteDialog, setShowBulkCompleteDialog] = useState(false);
  const [isBulkCompleting, setIsBulkCompleting] = useState(false);
  
  // Prescription form state
  const [selectedMedication, setSelectedMedication] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
  const [medicationSearchOpen, setMedicationSearchOpen] = useState(false);
  const [searchedMedications, setSearchedMedications] = useState<string[]>([]);
  const [isSearchingMedications, setIsSearchingMedications] = useState(false);
  const [isSavingPrescriptions, setIsSavingPrescriptions] = useState(false);
  const [commonMedications, setCommonMedications] = useState<string[]>([]);

  // Load common medications from database
  useEffect(() => {
    const loadCommonMedications = async () => {
      try {
        const response = await fetch(
          "/api/medications/catalog?commonOnly=true&limit=50"
        );
        const result = await response.json();
        if (result.success) {
          setCommonMedications(result.data.map((med: any) => med.name));
        }
      } catch (error) {
        console.error("Error loading common medications:", error);
        // Fallback to hardcoded list if API fails
        setCommonMedications([
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
        ]);
      }
    };

    loadCommonMedications();
  }, []);

  // Get latest administration for a medication
  const getLatestAdministration = useCallback((medicationId: string) => {
    return administrations
      .filter((admin) => admin.prescriptionId === medicationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [administrations]);

  // Handle marking prescription as complete
  const handleMarkAsComplete = async (prescriptionId: string) => {
    try {
      const response = await authenticatedPatch(
        `/api/prescriptions/${prescriptionId}/complete`,
        user
      );

      if (!response.ok) {
        throw new Error('Failed to mark prescription as complete');
      }

      // Refresh medications data to show updated status
      await onMedicationDataRefresh();

      // Use Sonner toast for better UX
      sonnerToast.success("Prescription Completed", {
        description: "The prescription has been marked as complete. Caregivers can no longer administer this medication.",
        duration: 4000,
      });
    } catch (error) {
      console.error('Error marking prescription as complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark prescription as complete. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle bulk complete functionality
  const handleSelectPrescription = (prescriptionId: string, checked: boolean) => {
    setSelectedPrescriptions(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(prescriptionId);
      } else {
        newSet.delete(prescriptionId);
      }
      return newSet;
    });
  };

  const handleSelectAllPrescriptions = (checked: boolean) => {
    if (checked) {
      const incompletePrescriptions = medications
        .filter(med => med.status !== 'completed' && med.status !== 'COMPLETED')
        .map(med => med.id);
      setSelectedPrescriptions(new Set(incompletePrescriptions));
    } else {
      setSelectedPrescriptions(new Set());
    }
  };

  const handleBulkComplete = () => {
    if (selectedPrescriptions.size === 0) return;
    setShowBulkCompleteDialog(true);
  };

  const handleConfirmBulkComplete = async () => {
    if (selectedPrescriptions.size === 0 || !user) return;

    setIsBulkCompleting(true);
    try {
      const response = await authenticatedPatch(
        '/api/prescriptions/bulk-complete',
        user,
        { prescriptionIds: Array.from(selectedPrescriptions) }
      );

      if (!response.ok) {
        throw new Error('Failed to mark prescriptions as complete');
      }

      const result = await response.json();

      // Refresh medications data to show updated status
      await onMedicationDataRefresh();

      // Clear selections
      setSelectedPrescriptions(new Set());
      setShowBulkCompleteDialog(false);

      // Use Sonner toast for better UX
      sonnerToast.success("Prescriptions Completed", {
        description: `${result.data.updatedCount} prescription(s) have been marked as complete. Caregivers can no longer administer these medications.`,
        duration: 4000,
      });
    } catch (error) {
      console.error('Error marking prescriptions as complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark prescriptions as complete. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBulkCompleting(false);
    }
  };

  return (
    <>
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
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onMedicationDataRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddPrescription(!showAddPrescription)}
              >
                {showAddPrescription ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    View Current
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Prescription
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showAddPrescription ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Use the prescription dialog to add medications
              </p>
              <Button onClick={onShowPrescribeDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Open Prescription Dialog
              </Button>
            </div>
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
                  {/* Bulk Actions - Only show when there are incomplete medications */}
                  {medications.some(med => med.status !== 'completed' && med.status !== 'COMPLETED') && (
                    <div className="flex items-center justify-between mb-4 p-3  rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">
                          {selectedPrescriptions.size} of {medications.filter(med => med.status !== 'completed' && med.status !== 'COMPLETED').length} selected
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectAllPrescriptions(selectedPrescriptions.size === 0)}
                          className="text-xs"
                        >
                          {selectedPrescriptions.size === medications.filter(med => med.status !== 'completed' && med.status !== 'COMPLETED').length ? 'Deselect All' : 'Select All'}
                        </Button>
                        {selectedPrescriptions.size > 0 && (
                          <Button
                            size="sm"
                            onClick={handleBulkComplete}
                            className="text-xs bg-purple-600 hover:bg-purple-700"
                          >
                            Mark Selected as Complete ({selectedPrescriptions.size})
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="w-12 py-2">
                            <input
                              type="checkbox"
                              checked={selectedPrescriptions.size > 0 && selectedPrescriptions.size === medications.filter(med => med.status !== 'completed' && med.status !== 'COMPLETED').length}
                              onChange={(e) => handleSelectAllPrescriptions(e.target.checked)}
                              className="rounded"
                            />
                          </th>
                          <th className="text-left py-2">Medication</th>
                          <th className="text-left py-2">Dosage</th>
                          <th className="text-left py-2">Frequency</th>
                          <th className="text-left py-2">Route</th>
                          <th className="text-left py-2">Instructions</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medications.length > 0 ? (
                          medications.map((medication) => {
                            return (
                              <tr
                                key={medication.id}
                                className="border-b"
                              >
                                <td className="py-4 w-12">
                                  {medication.status !== 'completed' && medication.status !== 'COMPLETED' ? (
                                    <input
                                      type="checkbox"
                                      checked={selectedPrescriptions.has(medication.id)}
                                      onChange={(e) => handleSelectPrescription(medication.id, e.target.checked)}
                                      className="rounded"
                                    />
                                  ) : null}
                                </td>
                                <td className="py-4">
                                  <div className="flex items-center space-x-3">
                                    <div>
                                      <p className={`font-medium text-base ${
                                        medication.status === 'completed' || medication.status === 'COMPLETED'
                                          ? 'text-muted-foreground line-through'
                                          : ''
                                      }`}>
                                        {medication.medicationName}
                                      </p>
                                    </div>
                                    {(medication.status === 'completed' || medication.status === 'COMPLETED') && (
                                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Completed
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4">
                                  <div className="text-sm font-medium">
                                    {medication.dosage || "Not specified"}
                                  </div>
                                </td>
                                <td className="py-4">
                                  <div className="text-sm">
                                    {medication.frequency ?
                                      medication.frequency.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
                                      : "Not specified"
                                    }
                                  </div>
                                </td>
                                <td className="py-4">
                                  <div className="text-sm">
                                    {medication.route ?
                                      medication.route.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
                                      : "Not specified"
                                    }
                                  </div>
                                </td>
                                <td className="py-4">
                                  <div className="text-sm text-muted-foreground">
                                    {medication.instructions && medication.instructions.length > 30 ? (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <button className="text-left hover:text-foreground transition-colors cursor-pointer">
                                            {medication.instructions.substring(0, 30)}...
                                            <span className="text-xs text-blue-500 ml-1">(view full)</span>
                                          </button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                          <DialogHeader>
                                            <DialogTitle>Instructions for {medication.medicationName}</DialogTitle>
                                          </DialogHeader>
                                          <div className="mt-4">
                                            <p className="text-sm whitespace-pre-wrap">{medication.instructions}</p>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    ) : (
                                      <span className="whitespace-pre-wrap">
                                        {medication.instructions || "No additional instructions"}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4">
                                  {(() => {
                                    const latestAdmin = getLatestAdministration(medication.id);
                                    return latestAdmin ? (
                                      <div className="text-sm">
                                        <div className="flex items-center space-x-2">
                                          <div className={`w-3 h-3 rounded-full ${
                                            (latestAdmin.status === 'administered' || latestAdmin.status === 'ADMINISTERED') ? 'bg-green-500' :
                                            (latestAdmin.status === 'missed' || latestAdmin.status === 'MISSED') ? 'bg-red-500' :
                                            (latestAdmin.status === 'refused' || latestAdmin.status === 'REFUSED') ? 'bg-red-500' : 'bg-yellow-500'
                                          }`}></div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {latestAdmin.administeredTime || latestAdmin.actualTime
                                            ? `${formatDateTime(new Date(latestAdmin.administeredTime || latestAdmin.actualTime!))}`
                                            : `${formatDateTime(new Date(latestAdmin.scheduledTime))}`}
                                        </p>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">Not administered yet</span>
                                    );
                                  })()}
                                </td>
                                <td className="py-4">
                                  {medication.status !== 'completed' && medication.status !== 'COMPLETED' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleMarkAsComplete(medication.id)}
                                      className="text-xs"
                                    >
                                      Mark as Complete
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Completed</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No medications found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Complete Confirmation Dialog */}
      <Dialog open={showBulkCompleteDialog} onOpenChange={setShowBulkCompleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Complete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to mark {selectedPrescriptions.size} prescription(s) as complete? 
              This action cannot be undone and will prevent caregivers from administering these medications.
            </p>
            {selectedPrescriptions.size > 0 && (
              <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                <p className="text-xs font-medium mb-2">Selected prescriptions:</p>
                {medications
                  .filter(med => selectedPrescriptions.has(med.id))
                  .map(med => (
                    <div key={med.id} className="text-xs py-1">
                      • {med.medicationName}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowBulkCompleteDialog(false)}
              disabled={isBulkCompleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBulkComplete}
              disabled={isBulkCompleting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isBulkCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                `Mark ${selectedPrescriptions.size} as Complete`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
