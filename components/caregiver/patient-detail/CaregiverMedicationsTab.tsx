"use client";

import React, { useState } from "react";
import { Patient } from "@/lib/types/patients";
import { User } from "@/lib/auth";
import { Medication, MedicationAdministration } from "@/lib/types/medications";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, Pill } from "lucide-react";
import { recordMedicationAdministrationClient, getMedicationAdministrationsClient } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";

interface CaregiverMedicationsTabProps {
  patient: Patient;
  user: User;
  medications: Medication[];
  administrations: MedicationAdministration[];
  isMedicalDataLoading: boolean;
  onAdministrationsUpdate: (administrations: MedicationAdministration[]) => void;
}

export function CaregiverMedicationsTab({
  patient,
  user,
  medications,
  administrations,
  isMedicalDataLoading,
  onAdministrationsUpdate,
}: CaregiverMedicationsTabProps) {
  const { toast } = useToast();

  // Filter state for Active/Completed medications
  const [medicationFilter, setMedicationFilter] = useState<'active' | 'completed'>('active');

  // Checkbox-based administration states
  const [selectedMedicationsForAdmin, setSelectedMedicationsForAdmin] = useState<Set<string>>(new Set());
  const [isAdministering, setIsAdministering] = useState(false);

  // Bulk administration dialog state
  const [showBulkAdminDialog, setShowBulkAdminDialog] = useState(false);
  const [bulkAdminData, setBulkAdminData] = useState<{
    medications: any[];
    status: 'administered' | 'refused' | 'missed';
    notes: string;
    administeredTime: string;
  }>({
    medications: [],
    status: 'administered',
    notes: '',
    administeredTime: new Date().toISOString()
  });

  // Get filtered medications based on current filter
  const getFilteredMedications = () => {
    return (medications || []).filter(med =>
      medicationFilter === 'active' ? med.isActive : !med.isActive
    );
  };

  // Handle filter change and clear selections
  const handleFilterChange = (filter: 'active' | 'completed') => {
    setMedicationFilter(filter);
    setSelectedMedicationsForAdmin(new Set()); // Clear selections when switching filters
  };

  // Get latest administration for a medication
  const getLatestAdministration = (medicationId: string) => {
    return (administrations || [])
      .filter(admin => admin.prescriptionId === medicationId)
      .sort((a, b) => new Date(b.administeredTime || b.actualTime || b.scheduledTime).getTime() -
                     new Date(a.administeredTime || a.actualTime || a.scheduledTime).getTime())[0];
  };

  // Checkbox-based administration functions
  const handleMedicationCheckboxChange = (medicationId: string, checked: boolean) => {
    const newSelected = new Set(selectedMedicationsForAdmin);
    if (checked) {
      newSelected.add(medicationId);
    } else {
      newSelected.delete(medicationId);
    }
    setSelectedMedicationsForAdmin(newSelected);
  };

  const handleBulkAdministration = () => {
    if (selectedMedicationsForAdmin.size === 0 || !user || !patient) return;

    const selectedMedications = (medications || []).filter(med =>
      selectedMedicationsForAdmin.has(med.id)
    );

    setBulkAdminData({
      medications: selectedMedications,
      status: 'administered',
      notes: '',
      administeredTime: new Date().toISOString()
    });
    setShowBulkAdminDialog(true);
  };

  const handleConfirmBulkAdministration = async () => {
    if (!user || !patient || bulkAdminData.medications.length === 0) return;

    setIsAdministering(true);
    try {
      const currentTime = bulkAdminData.administeredTime;

      // Record administration for each selected medication
      for (const medication of bulkAdminData.medications) {
        const administrationData = {
          prescriptionId: medication.id,
          patientId: patient.id,
          administeredById: user.id,
          scheduledTime: currentTime,
          administeredTime: bulkAdminData.status === 'administered' ? currentTime : undefined,
          status: bulkAdminData.status.toUpperCase() as any,
          dosageGiven: bulkAdminData.status === 'administered' ? (medication.dosage || "as prescribed") : undefined,
          notes: bulkAdminData.notes || `Bulk ${bulkAdminData.status} by ${user.firstName} ${user.lastName}`,
          patientResponse: bulkAdminData.status === 'administered' ? "good" as any : undefined,
          createdAt: currentTime,
          updatedAt: currentTime,
        };

        await recordMedicationAdministrationClient(administrationData, user);
      }

      // Refresh administrations
      const updatedAdministrations = await getMedicationAdministrationsClient(
        patient.id,
        user
      );
      onAdministrationsUpdate(updatedAdministrations);

      toast({
        title: `Medications ${bulkAdminData.status === 'administered' ? 'Administered' : bulkAdminData.status === 'refused' ? 'Marked as Refused' : 'Marked as Missed'}`,
        description: `${bulkAdminData.medications.length} medication(s) have been recorded as ${bulkAdminData.status}.`,
      });

      // Clear selections and close dialog
      setSelectedMedicationsForAdmin(new Set());
      setShowBulkAdminDialog(false);
    } catch (error) {
      console.error("Bulk administration error:", error);
      toast({
        title: "Error",
        description: "Failed to record medication administration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdministering(false);
    }
  };

  return (
    <>
      {/* Current Medications with Administration */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>
                {medicationFilter === 'active' ? 'Active' : 'Completed'} Medications
                {medicationFilter === 'active' && ' & Administration'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {medicationFilter === 'active'
                  ? 'Current medications that can be administered'
                  : 'Previously prescribed medications (completed/discontinued)'
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Filter Toggle Buttons */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={medicationFilter === 'active' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleFilterChange('active')}
                  className="h-8 px-3"
                >
                  Active
                </Button>
                <Button
                  variant={medicationFilter === 'completed' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleFilterChange('completed')}
                  className="h-8 px-3"
                >
                  Completed
                </Button>
              </div>

              {/* Bulk Administration Button - Only show for active medications */}
              {medicationFilter === 'active' && selectedMedicationsForAdmin.size > 0 && (
                <Button
                  onClick={handleBulkAdministration}
                  disabled={isAdministering}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isAdministering
                    ? "Administering..."
                    : `Administer Selected (${selectedMedicationsForAdmin.size})`
                  }
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isMedicalDataLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : getFilteredMedications().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 w-12">
                      {medicationFilter === 'active' && (
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedMedicationsForAdmin.size === getFilteredMedications().length && getFilteredMedications().length > 0}
                          onChange={(e) => {
                            const filteredMedications = getFilteredMedications();
                            if (e.target.checked) {
                              setSelectedMedicationsForAdmin(new Set(filteredMedications.map(m => m.id)));
                            } else {
                              setSelectedMedicationsForAdmin(new Set());
                            }
                          }}
                        />
                      )}
                    </th>
                    <th className="text-left py-2">Medication</th>
                    <th className="text-left py-2">Dosage</th>
                    <th className="text-left py-2">Route</th>
                    <th className="text-left py-2">Frequency</th>
                    <th className="text-left py-2">Instructions</th>
                    <th className="text-left py-2">
                      {medicationFilter === 'active' ? 'Recent Administrations' : 'Administration History'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredMedications()
                    .sort((a, b) => (a.medicationName || '').localeCompare(b.medicationName || ''))
                    .map((medication) => {
                      return (
                        <tr key={medication.id} className="border-b">
                          <td className="py-3">
                            {medicationFilter === 'active' && (
                              <input
                                type="checkbox"
                                className="rounded border-gray-300"
                                checked={selectedMedicationsForAdmin.has(medication.id)}
                                onChange={(e) => handleMedicationCheckboxChange(medication.id, e.target.checked)}
                              />
                            )}
                          </td>
                          <td className="py-3">
                            <p className="font-medium">
                              {medication.medicationName}
                            </p>
                          </td>
                          <td className="py-3">
                            <div className="text-sm font-medium">
                              {medication.dosage || "Not specified"}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="text-sm text-muted-foreground">
                              {medication.route ?
                                medication.route.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
                                : "Oral"
                              }
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="text-sm">
                              {medication.frequency ?
                                medication.frequency.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
                                : "As needed"
                              }
                            </div>
                          </td>
                          <td className="py-3">
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
                          <td className="py-3">
                            {(() => {
                              // Get recent 3 administrations for this medication (ALL statuses)
                              const medicationAdministrations = (administrations || [])
                                .filter(admin => admin.prescriptionId === medication.id)
                                .sort((a, b) => new Date(b.administeredTime || b.actualTime || b.scheduledTime).getTime() - new Date(a.administeredTime || a.actualTime || a.scheduledTime).getTime())
                                .slice(0, 3);

                              return medicationAdministrations.length > 0 ? (
                                <div className="space-y-1">
                                  {medicationAdministrations.map((admin, index) => (
                                    <div key={admin.id || index} className="flex items-center space-x-2 text-xs">
                                      <div className={`w-3 h-3 rounded-full ${
                                        (admin.status === 'administered' || admin.status === 'ADMINISTERED') ? 'bg-green-500' :
                                        (admin.status === 'missed' || admin.status === 'MISSED') ? 'bg-red-500' :
                                        (admin.status === 'refused' || admin.status === 'REFUSED') ? 'bg-orange-500' : 'bg-yellow-500'
                                      }`}></div>
                                      <span className="text-muted-foreground">
                                        {admin.administeredTime || admin.actualTime
                                          ? formatDateTime(new Date(admin.administeredTime || admin.actualTime!))
                                          : formatDateTime(new Date(admin.scheduledTime))
                                        }
                                      </span>
                                      <span className={`text-xs font-medium ${
                                        (admin.status === 'administered' || admin.status === 'ADMINISTERED') ? 'text-green-700' :
                                        (admin.status === 'missed' || admin.status === 'MISSED') ? 'text-red-700' :
                                        (admin.status === 'refused' || admin.status === 'REFUSED') ? 'text-orange-700' : 'text-yellow-700'
                                      }`}>
                                        {(admin.status || '').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  No administrations yet
                                </span>
                              );
                            })()}
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
                {medicationFilter === 'active'
                  ? 'No active medications prescribed yet.'
                  : 'No completed medications found.'
                }
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {medicationFilter === 'active'
                  ? 'Medications prescribed by reviewers will appear here.'
                  : 'Previously prescribed medications that have been completed or discontinued will appear here.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Administration Dialog */}
      <Dialog open={showBulkAdminDialog} onOpenChange={setShowBulkAdminDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Medication Administration</DialogTitle>
            <DialogDescription>
              Record administration status for {bulkAdminData.medications.length} selected medication(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selected Medications List */}
            <div>
              <label className="block text-sm font-medium mb-2">Selected Medications:</label>
              <div className=" rounded-md p-3 max-h-32 overflow-y-auto">
                {bulkAdminData.medications.map((med) => (
                  <div key={med.id} className="text-sm py-1">
                    • {med.medication?.name || med.medicationName} ({med.dosage || 'as prescribed'})
                  </div>
                ))}
              </div>
            </div>

            {/* Administration Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Status:</label>
              <RadioGroup
                value={bulkAdminData.status}
                onValueChange={(value: 'administered' | 'refused' | 'missed') =>
                  setBulkAdminData(prev => ({ ...prev, status: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="administered" id="administered" />
                  <Label htmlFor="administered" className="text-green-700">Administered</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="refused" id="refused" />
                  <Label htmlFor="refused" className="text-red-700">Refused by Patient</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="missed" id="missed" />
                  <Label htmlFor="missed" className="text-yellow-700">Missed/Not Given</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Administration Time */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {bulkAdminData.status === 'administered' ? 'Administration Time:' : 'Time Recorded:'}
              </label>
              <Input
                type="datetime-local"
                value={new Date(bulkAdminData.administeredTime).toISOString().slice(0, 16)}
                onChange={(e) =>
                  setBulkAdminData(prev => ({
                    ...prev,
                    administeredTime: new Date(e.target.value).toISOString()
                  }))
                }
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional):</label>
              <textarea
                placeholder={`Add notes about ${bulkAdminData.status === 'administered' ? 'administration' : bulkAdminData.status}...`}
                value={bulkAdminData.notes}
                onChange={(e) => setBulkAdminData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkAdminDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBulkAdministration}
              disabled={isAdministering}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isAdministering ? "Recording..." : `Record ${bulkAdminData.status === 'administered' ? 'Administration' : bulkAdminData.status === 'refused' ? 'Refusal' : 'Missed Dose'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
