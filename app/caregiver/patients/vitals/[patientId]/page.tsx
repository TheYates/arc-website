"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  VitalsRecordingDialog,
  VitalsFormData,
} from "@/components/medical/vitals-recording-dialog";
import { VitalsChart } from "@/components/medical/vitals-chart";
import { getPatientById } from "@/lib/api/patients";
import { getVitalSigns } from "@/lib/api/vitals";
import { createVitalSignsClient } from "@/lib/api/vitals-client";
import { useAuth } from "@/lib/auth";
import { Patient } from "@/lib/types/patients";
import { VitalSigns } from "@/lib/types/vitals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default function CaregiverVitalsPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientData = await getPatientById(resolvedParams.patientId);
        if (patientData) {
          setPatient(patientData);
          const vitalsData = await getVitalSigns(resolvedParams.patientId);
          setVitals(vitalsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.patientId]);

  const handleVitalsSaved = (newVitals: VitalSigns) => {
    setVitals((prev) => [newVitals, ...prev]);
  };

  const handleSaveVitals = async (vitalsData: VitalsFormData) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const result = await createVitalSignsClient({
        patientId: resolvedParams.patientId,
        systolicBp: vitalsData.systolicBp || undefined,
        diastolicBp: vitalsData.diastolicBp || undefined,
        heartRate: vitalsData.heartRate || undefined,
        temperature: vitalsData.temperature || undefined,
        oxygenSaturation: vitalsData.oxygenSaturation || undefined,
        weightKg: vitalsData.weightKg || undefined,
        bloodSugar: vitalsData.bloodSugar || undefined,
        notes: vitalsData.notes || undefined,
      });

      if (result) {
        // Convert the result to match our VitalSigns type
        const newVital: VitalSigns = {
          id: result.id,
          patientId: result.patientId,
          caregiverId: result.recordedById || user.id,
          heartRate: result.heartRate || undefined,
          temperature: result.temperature || undefined,
          bloodPressure:
            result.systolicBp && result.diastolicBp
              ? {
                  systolic: result.systolicBp,
                  diastolic: result.diastolicBp,
                }
              : undefined,
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

        handleVitalsSaved(newVital);
        setIsDialogOpen(false);
        toast({
          title: "Success",
          description: "Vital signs recorded successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving vitals:", error);
      toast({
        title: "Error",
        description: "Failed to save vital signs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="text-muted-foreground">Patient not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Vitals Management</h1>
          <p className="text-muted-foreground">
            {patient.firstName} {patient.lastName} - ID: {patient.id}
          </p>
        </div>
      </div>

      <Tabs defaultValue="record" className="hidden md:block space-y-6">
        <TabsList>
          <TabsTrigger value="record">Record Vitals</TabsTrigger>
          <TabsTrigger value="trends">View Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="record">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Record Vital Signs</h2>
                <p className="text-muted-foreground">
                  Record new vital signs for {patient.firstName}{" "}
                  {patient.lastName}
                </p>
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Vitals
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <VitalsChart
            patientId={resolvedParams.patientId}
            patientName={`${patient.firstName} ${patient.lastName}`}
          />
        </TabsContent>
      </Tabs>

      <VitalsRecordingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveVitals}
        patientName={`${patient.firstName} ${patient.lastName}`}
        isLoading={isSaving}
      />
      </div>
    </div>
  );
}
