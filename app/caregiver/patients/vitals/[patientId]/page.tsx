"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VitalsRecordingForm } from "@/components/medical/vitals-recording-form";
import { VitalsChart } from "@/components/medical/vitals-chart";
import { getPatientById } from "@/lib/api/patients";
import { getVitalSigns } from "@/lib/api/vitals";
import { useAuth } from "@/lib/auth";
import { Patient } from "@/lib/types/patients";
import { VitalSigns } from "@/lib/types/vitals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default function CaregiverVitalsPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      try {
        const patientData = getPatientById(resolvedParams.patientId);
        if (patientData) {
          setPatient(patientData);
          const vitalsData = getVitalSigns(resolvedParams.patientId);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
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

      <Tabs defaultValue="record" className="space-y-6">
        <TabsList>
          <TabsTrigger value="record">Record Vitals</TabsTrigger>
          <TabsTrigger value="trends">View Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="record">
          <VitalsRecordingForm
            patientId={resolvedParams.patientId}
            patientName={`${patient.firstName} ${patient.lastName}`}
            caregiverId={user?.id || ""}
            onSave={handleVitalsSaved}
          />
        </TabsContent>

        <TabsContent value="trends">
          <VitalsChart
            patientId={resolvedParams.patientId}
            patientName={`${patient.firstName} ${patient.lastName}`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
