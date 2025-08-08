"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPatientById } from "@/lib/api/patients";
import { getMedications } from "@/lib/api/medications";
import { Patient } from "@/lib/types/patients";
import { Medication } from "@/lib/types/medications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill } from "lucide-react";

export function CaregiverMedicationsMobile({
  patientId,
}: {
  patientId: string;
}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    (async () => {
      const p = await getPatientById(patientId);
      const meds = await getMedications(patientId);
      setPatient(p || null);
      setMedications((meds || []).filter((m) => m.isActive));
    })();
  }, [patientId]);

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="font-semibold">
        {patient ? `${patient.firstName} ${patient.lastName}` : "—"}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="h-4 w-4 text-blue-600" />
            <div className="font-medium">Active Medications</div>
          </div>
          {medications.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No active medications.
            </div>
          ) : (
            <ul className="text-sm space-y-2">
              {medications.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <span>{m.medicationName}</span>
                  <Badge variant="outline" className="capitalize">
                    {m.frequency.replace("_", " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3">
            <Button asChild size="sm" variant="outline">
              <Link href={`/caregiver/patients/medications/${patientId}`}>
                Record Administration
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
