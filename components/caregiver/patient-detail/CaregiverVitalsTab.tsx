"use client";

import React, { useState } from "react";
import { Patient } from "@/lib/types/patients";
import { User } from "@/lib/auth";
import { VitalSigns } from "@/lib/types/vitals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VitalsRecordingDialog, VitalsFormData } from "@/components/medical/vitals-recording-dialog";
import { createVitalSignsClient } from "@/lib/api/vitals-client";
import { useToast } from "@/hooks/use-toast";
import { Activity, Plus } from "lucide-react";

interface CaregiverVitalsTabProps {
  patient: Patient;
  user: User;
  vitals: VitalSigns[];
  onVitalsUpdate: (vitals: VitalSigns[]) => void;
  isMedicalDataLoading?: boolean;
}

export function CaregiverVitalsTab({
  patient,
  user,
  vitals,
  onVitalsUpdate,
  isMedicalDataLoading = false,
}: CaregiverVitalsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Helper function to get status styling for vital values (same as PatientVitalsTab)
  const getVitalStatus = (type: string, value: number | string) => {
    switch (type) {
      case 'heartRate':
        const hr = Number(value);
        if (hr < 60) return { label: 'Low', color: 'text-blue-600' };
        if (hr > 100) return { label: 'High', color: 'text-red-600' };
        return { label: 'Normal', color: 'text-green-600' };

      case 'temperature':
        const temp = Number(value);
        if (temp < 97.0) return { label: 'Low', color: 'text-blue-600' };
        if (temp > 99.5) return { label: 'High', color: 'text-red-600' };
        return { label: 'Normal', color: 'text-green-600' };

      case 'bloodPressure':
        const [systolic, diastolic] = String(value).split('/').map(Number);
        if (systolic < 90 || diastolic < 60) return { label: 'Low', color: 'text-blue-600' };
        if (systolic > 140 || diastolic > 90) return { label: 'High', color: 'text-red-600' };
        return { label: 'Normal', color: 'text-green-600' };

      case 'oxygenSaturation':
        const o2 = Number(value);
        if (o2 < 95) return { label: 'Low', color: 'text-red-600' };
        return { label: 'Normal', color: 'text-green-600' };

      case 'bloodSugar':
        const bs = Number(value);
        if (bs < 70 || bs > 140) return { label: 'Abnormal', color: 'text-red-600' };
        return { label: 'Normal', color: 'text-green-600' };

      default:
        return { label: 'Normal', color: 'text-green-600' };
    }
  };

  // Helper function to format vital values (same as PatientVitalsTab)
  const formatVitalValue = (vital: VitalSigns) => {
    const values: Array<{
      type: string;
      label: string;
      value: string;
      status: { label: string; color: string };
    }> = [];

    if (vital.heartRate) {
      values.push({
        type: 'heartRate',
        label: 'Heart Rate',
        value: `${vital.heartRate} bpm`,
        status: getVitalStatus('heartRate', vital.heartRate)
      });
    }

    if (vital.temperature) {
      const tempF = Number(vital.temperature) * 9/5 + 32; // Convert C to F
      values.push({
        type: 'temperature',
        label: 'Temperature',
        value: `${tempF.toFixed(1)}°F`,
        status: getVitalStatus('temperature', tempF)
      });
    }

    if (vital.bloodPressure?.systolic && vital.bloodPressure?.diastolic) {
      const bpValue = `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}`;
      values.push({
        type: 'bloodPressure',
        label: 'Blood Pressure',
        value: `${bpValue} mmHg`,
        status: getVitalStatus('bloodPressure', bpValue)
      });
    }

    if (vital.oxygenSaturation) {
      values.push({
        type: 'oxygenSaturation',
        label: 'Oxygen Saturation',
        value: `${vital.oxygenSaturation}%`,
        status: getVitalStatus('oxygenSaturation', vital.oxygenSaturation)
      });
    }

    if (vital.bloodSugar) {
      values.push({
        type: 'bloodSugar',
        label: 'Blood Sugar',
        value: `${vital.bloodSugar} mg/dL`,
        status: getVitalStatus('bloodSugar', Number(vital.bloodSugar))
      });
    }

    if (vital.weight) {
      values.push({
        type: 'weight',
        label: 'Weight',
        value: `${vital.weight} kg`,
        status: { label: 'Recorded', color: 'text-gray-600' }
      });
    }

    return values;
  };

  const handleSaveVitals = async (vitalsData: VitalsFormData) => {
    setIsLoading(true);
    try {
      // Format data according to the API expectations
      const vitalSignsData = {
        patientId: patient.id,
        systolicBp: vitalsData.systolicBp || undefined,
        diastolicBp: vitalsData.diastolicBp || undefined,
        heartRate: vitalsData.heartRate || undefined,
        temperature: vitalsData.temperature || undefined,
        oxygenSaturation: vitalsData.oxygenSaturation || undefined,
        weightKg: vitalsData.weightKg || undefined,
        bloodSugar: vitalsData.bloodSugar || undefined,
        notes: vitalsData.notes || undefined,
      };

      const result = await createVitalSignsClient(vitalSignsData);

      // The API returns { vitals: VitalSignsResponse } directly
      if (result) {
        toast({
          title: "Vital signs recorded",
          description: "The vital signs have been successfully recorded.",
        });

        // Convert the result to match our VitalSigns type
        const newVital: VitalSigns = {
          id: result.id,
          patientId: result.patientId,
          caregiverId: result.recordedById || user.id,
          heartRate: result.heartRate || undefined,
          temperature: result.temperature || undefined,
          bloodPressure: result.systolicBp && result.diastolicBp ? {
            systolic: result.systolicBp,
            diastolic: result.diastolicBp,
          } : undefined,
          oxygenSaturation: result.oxygenSaturation || undefined,
          weight: result.weightKg || undefined,
          bloodSugar: result.bloodSugar || undefined,
          notes: result.notes || undefined,
          recordedAt: result.recordedDate || new Date().toISOString(),
          isAlerted: false,
          alertedValues: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Update the vitals list
        const updatedVitals = [newVital, ...vitals];
        onVitalsUpdate(updatedVitals);
        setIsDialogOpen(false);
      } else {
        throw new Error("Failed to record vital signs");
      }
    } catch (error) {
      console.error("Error recording vital signs:", error);
      toast({
        title: "Error",
        description: "Failed to record vital signs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Vital Signs History
          </CardTitle>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Vitals
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isMedicalDataLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : vitals.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Heart Rate</TableHead>
                  <TableHead>Blood Pressure</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>O2 Saturation</TableHead>
                  <TableHead>Blood Sugar</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vitals
                  .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                  .map((vital) => {
                    const vitalValues = formatVitalValue(vital);
                    const hasAnyValues = vitalValues.length > 0;

                    if (!hasAnyValues) return null;

                    // Create a map for easy lookup
                    const valueMap = vitalValues.reduce((acc, v) => {
                      acc[v.type] = v;
                      return acc;
                    }, {} as Record<string, any>);

                    return (
                      <TableRow
                        key={vital.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {new Date(vital.recordedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(vital.recordedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {valueMap.heartRate ? (
                            <div className="space-y-1">
                              <div className="font-medium">{valueMap.heartRate.value}</div>
                              <div className={`text-xs font-medium ${valueMap.heartRate.status.color}`}>
                                {valueMap.heartRate.status.label}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {valueMap.bloodPressure ? (
                            <div className="space-y-1">
                              <div className="font-medium">{valueMap.bloodPressure.value}</div>
                              <div className={`text-xs font-medium ${valueMap.bloodPressure.status.color}`}>
                                {valueMap.bloodPressure.status.label}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {valueMap.temperature ? (
                            <div className="space-y-1">
                              <div className="font-medium">{valueMap.temperature.value}</div>
                              <div className={`text-xs font-medium ${valueMap.temperature.status.color}`}>
                                {valueMap.temperature.status.label}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {valueMap.oxygenSaturation ? (
                            <div className="space-y-1">
                              <div className="font-medium">{valueMap.oxygenSaturation.value}</div>
                              <div className={`text-xs font-medium ${valueMap.oxygenSaturation.status.color}`}>
                                {valueMap.oxygenSaturation.status.label}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {valueMap.bloodSugar ? (
                            <div className="space-y-1">
                              <div className="font-medium">{valueMap.bloodSugar.value}</div>
                              <div className={`text-xs font-medium ${valueMap.bloodSugar.status.color}`}>
                                {valueMap.bloodSugar.status.label}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {valueMap.weight ? (
                            <div className="space-y-1">
                              <div className="font-medium">{valueMap.weight.value}</div>
                              <div className={`text-xs font-medium ${valueMap.weight.status.color}`}>
                                {valueMap.weight.status.label}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {vital.notes ? (
                            vital.notes.length > 50 ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="text-sm text-muted-foreground max-w-xs truncate hover:text-foreground transition-colors cursor-pointer text-left">
                                    {vital.notes}
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Vital Signs Notes</DialogTitle>
                                  </DialogHeader>
                                  <div className="mt-4">
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Recorded on {new Date(vital.recordedAt).toLocaleString()}
                                    </p>
                                    <div className="text-sm whitespace-pre-wrap">
                                      {vital.notes}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {vital.notes}
                              </div>
                            )
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No vital signs recorded yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Record Vitals" to add the first vital signs entry.
            </p>
          </div>
        )}
      </CardContent>

      <VitalsRecordingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveVitals}
        patientName={`${patient.firstName} ${patient.lastName}`}
        isLoading={isLoading}
      />
    </Card>
  );
}
