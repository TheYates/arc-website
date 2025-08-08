"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPatientById } from "@/lib/api/patients";
import { getVitalSigns } from "@/lib/api/vitals";
import { Patient } from "@/lib/types/patients";
import { VitalSigns } from "@/lib/types/vitals";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function CaregiverVitalsMobile({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);

  useEffect(() => {
    (async () => {
      const p = await getPatientById(patientId);
      const v = await getVitalSigns(patientId);
      setPatient(p || null);
      setVitals(v || []);
    })();
  }, [patientId]);

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          {patient ? `${patient.firstName} ${patient.lastName}` : "—"}
        </div>
        <Button asChild size="sm">
          <Link href={`/caregiver/patients/vitals/${patientId}`}>
            <Plus className="h-4 w-4 mr-2" /> Record
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-green-600" />
            <div className="font-medium">Recent Vitals</div>
          </div>
          {vitals.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No vitals recorded.
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {vitals.slice(0, 5).map((vt) => (
                <div key={vt.id} className="flex justify-between">
                  <span>{formatDate(new Date(vt.recordedAt))}</span>
                  <span className="text-muted-foreground">
                    HR {vt.heartRate ?? "-"} • Temp {vt.temperature ?? "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
