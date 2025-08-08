"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MedicationAdministrationForm } from "@/components/medical/medication-administration-form";
import { getPatientById } from "@/lib/api/patients";
import {
  getMedications,
  getMedicationAdministrations,
} from "@/lib/api/medications";
import { useAuth } from "@/lib/auth";
import { Patient } from "@/lib/types/patients";
import { Medication, MedicationAdministration } from "@/lib/types/medications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pill, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { CaregiverMedicationsMobile } from "@/components/mobile/caregiver-medications";

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default function CaregiverMedicationsPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [administrations, setAdministrations] = useState<
    MedicationAdministration[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientData = await getPatientById(resolvedParams.patientId);
        if (patientData) {
          setPatient(patientData);
          const medicationsData = (
            await getMedications(resolvedParams.patientId)
          ).filter((m) => m.isActive);
          setMedications(medicationsData);
          const administrationsData = await getMedicationAdministrations(
            resolvedParams.patientId
          );
          setAdministrations(administrationsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.patientId]);

  const handleAdministrationSaved = (
    newAdministration: MedicationAdministration
  ) => {
    setAdministrations((prev) => [newAdministration, ...prev]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "administered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "missed":
      case "refused":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <CaregiverMedicationsMobile patientId={resolvedParams.patientId} />
      </div>

      {/* Header (Desktop) */}
      <div className="hidden md:flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Medication Administration</h1>
          <p className="text-muted-foreground">
            {patient.firstName} {patient.lastName} - ID: {patient.id}
          </p>
        </div>
      </div>

      <Tabs defaultValue="administer" className="hidden md:block space-y-6">
        <TabsList>
          <TabsTrigger value="administer">Record Administration</TabsTrigger>
          <TabsTrigger value="history">Administration History</TabsTrigger>
        </TabsList>

        <TabsContent value="administer">
          <MedicationAdministrationForm
            patientId={resolvedParams.patientId}
            patientName={`${patient.firstName} ${patient.lastName}`}
            caregiverId={user?.id || ""}
            onSave={handleAdministrationSaved}
          />
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-4">
            {administrations.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No medication administrations recorded yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              administrations.map((administration) => {
                const medication = medications.find(
                  (m) => m.id === administration.medicationId
                );
                return (
                  <Card key={administration.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Pill className="h-5 w-5 mr-2" />
                        {medication?.medicationName || "Unknown Medication"}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(administration.status)}
                        <Badge variant="outline" className="capitalize">
                          {administration.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Medication Details
                          </p>
                          <p className="font-medium">{medication?.dosage}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {medication?.route?.replace("_", " ") || "Oral"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Scheduled Time
                          </p>
                          <p>
                            {new Date(
                              administration.scheduledTime
                            ).toLocaleString()}
                          </p>
                        </div>
                        {administration.actualTime && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Actual Time
                            </p>
                            <p>
                              {new Date(
                                administration.actualTime
                              ).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {administration.dosageGiven && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Dosage Given
                            </p>
                            <p>{administration.dosageGiven}</p>
                          </div>
                        )}
                        {administration.patientResponse && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Patient Response
                            </p>
                            <p className="capitalize">
                              {administration.patientResponse}
                            </p>
                          </div>
                        )}
                      </div>
                      {administration.notes && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-muted-foreground">
                            Notes
                          </p>
                          <p className="text-sm">{administration.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
