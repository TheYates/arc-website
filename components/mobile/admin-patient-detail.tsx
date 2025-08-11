"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPatientById } from "@/lib/api/patients";
import { getAvailableStaff, getWorkloadStats } from "@/lib/api/assignments";
import { Patient } from "@/lib/types/patients";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Users, Eye, Stethoscope, Calendar, AlertTriangle } from "lucide-react";

export function AdminPatientMobile({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await getPatientById(patientId);
        if (!mounted) return;
        setPatient(p);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  if (loading)
    return (
      <div className="px-4 py-6 text-sm text-muted-foreground">Loading...</div>
    );

  if (!patient) {
    return (
      <div className="px-4 py-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2 font-medium">Patient not found</div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/patients")}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/patients")}
        className="px-0 w-fit"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Patients
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Patient Details</h1>
        <p className="text-sm text-muted-foreground">
          View and manage patient information
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-blue-100 text-blue-700">
            {patient.firstName?.[0]}
            {patient.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="text-lg font-semibold">
            {patient.firstName} {patient.lastName}
          </div>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" className="capitalize">
              {patient.careLevel || "Standard"} Care
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 capitalize">
              {patient.status || "Active"}
            </Badge>
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

      <Card>
        <CardContent className="p-4">
          <div className="font-medium mb-2">Assignments</div>
          <div className="text-sm space-y-2">
            {patient.assignedCaregiver ? (
              <div className="flex items-center gap-2 text-green-700">
                <Eye className="h-4 w-4" /> Caregiver:{" "}
                {patient.assignedCaregiver.name}
              </div>
            ) : (
              <Badge variant="outline">No caregiver</Badge>
            )}
            {patient.assignedReviewer ? (
              <div className="flex items-center gap-2 text-purple-700">
                <Stethoscope className="h-4 w-4" /> Reviewer:{" "}
                {patient.assignedReviewer.name}
              </div>
            ) : (
              <Badge variant="outline">No reviewer</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        onClick={() => router.push(`/admin/patients/${patient.id}`)}
      >
        <Calendar className="h-4 w-4 mr-2" /> Full Details
      </Button>
    </div>
  );
}
