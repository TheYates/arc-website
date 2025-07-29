"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MedicationPrescriptionForm } from "@/components/medical/medication-prescription-form";
import { getPatientById } from "@/lib/api/patients";
import { getMedications } from "@/lib/api/medications";
import { useAuth } from "@/lib/auth";
import { Patient } from "@/lib/types/patients";
import { Medication } from "@/lib/types/medications";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pill, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default function ReviewerMedicationsPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      try {
        const patientData = getPatientById(resolvedParams.patientId);
        if (patientData) {
          setPatient(patientData);
          const medicationsData = getMedications(resolvedParams.patientId);
          setMedications(medicationsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.patientId]);

  const handleMedicationSaved = (newMedication: Medication) => {
    setMedications((prev) => [newMedication, ...prev]);
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
          <h1 className="text-2xl font-bold">Medication Management</h1>
          <p className="text-muted-foreground">
            {patient.firstName} {patient.lastName} - ID: {patient.id}
          </p>
        </div>
      </div>

      <Tabs defaultValue="prescribe" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prescribe">Prescribe Medication</TabsTrigger>
          <TabsTrigger value="current">Current Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="prescribe">
          <MedicationPrescriptionForm
            patientId={resolvedParams.patientId}
            patientName={`${patient.firstName} ${patient.lastName}`}
            prescribedBy={user?.id || ""}
            onSave={handleMedicationSaved}
          />
        </TabsContent>

        <TabsContent value="current">
          <div className="grid gap-4">
            {medications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No medications prescribed yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              medications.map((medication) => (
                <Card key={medication.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Pill className="h-5 w-5 mr-2" />
                      {medication.medicationName}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Badge
                        variant={medication.isActive ? "default" : "secondary"}
                      >
                        {medication.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{medication.priority}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Dosage
                        </p>
                        <p>{medication.dosage}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Frequency
                        </p>
                        <p className="capitalize">
                          {medication.frequency.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Route
                        </p>
                        <p className="capitalize">
                          {medication.route.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Start Date
                        </p>
                        <p>{formatDate(new Date(medication.startDate))}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Instructions
                      </p>
                      <p className="text-sm">{medication.instructions}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
