"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPatientByIdClient } from "@/lib/api/client";
import { getVitalSigns } from "@/lib/api/vitals";
import { getMedicationsClient } from "@/lib/api/client";
import { getMedicalReviews } from "@/lib/api/medical-reviews-client";
import { Patient } from "@/lib/types/patients";
import type { VitalSigns } from "@/lib/types/vitals";
import type { Medication } from "@/lib/types/medications";
import type { MedicalReview } from "@/lib/types/medical-reviews";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Activity, Pill, FileText } from "lucide-react";

export function ReviewerPatientMobile({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reviews, setReviews] = useState<MedicalReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await getPatientByIdClient(patientId);
        const v = getVitalSigns(patientId);
        const m = await getMedicationsClient(patientId);
        const r = await getMedicalReviews(patientId);
        if (!mounted) return;
        setPatient(p);
        setVitals(v);
        setMedications(m);
        setReviews(r);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  if (loading) {
    return (
      <div className="px-4 py-6 text-sm text-muted-foreground">Loading...</div>
    );
  }

  if (!patient) {
    return (
      <div className="px-4 py-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2 font-medium">Patient not found</div>
            <Button
              variant="outline"
              onClick={() => router.push("/reviewer/patients")}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeMeds = (medications || []).filter((m) => m.isActive);

  return (
    <div className="px-4 py-4 space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push("/reviewer/patients")}
        className="px-0"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-purple-100 text-purple-700">
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
            <Badge className="bg-purple-100 text-purple-800 capitalize">
              {patient.status || "Active"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold">{vitals.length}</div>
            <div className="text-xs text-muted-foreground">Vitals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold">{activeMeds.length}</div>
            <div className="text-xs text-muted-foreground">Active Meds</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold">{reviews.length}</div>
            <div className="text-xs text-muted-foreground">Reviews</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent vitals */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-teal-600" />
            <div className="font-medium">Recent Vitals</div>
          </div>
          {vitals.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No vitals recorded.
            </div>
          ) : (
            <div className="space-y-2">
              {vitals.slice(0, 2).map((v) => (
                <div key={v.id} className="text-sm flex justify-between">
                  <span>{formatDate(new Date(v.recordedAt))}</span>
                  <span className="text-muted-foreground">
                    HR {v.heartRate ?? "-"} | Temp {v.temperature ?? "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="h-4 w-4 text-blue-600" />
            <div className="font-medium">Active Medications</div>
          </div>
          {activeMeds.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No active medications.
            </div>
          ) : (
            <ul className="text-sm list-disc pl-5 space-y-1">
              {activeMeds.slice(0, 3).map((m) => (
                <li key={m.id}>{m.medicationName}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-purple-600" />
            <div className="font-medium">Recent Reviews</div>
          </div>
          {reviews.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No medical reviews yet.
            </div>
          ) : (
            <ul className="text-sm space-y-1">
              {reviews.slice(0, 2).map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>{r.title}</span>
                  <span className="text-muted-foreground">
                    {formatDate(new Date(r.createdAt))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
