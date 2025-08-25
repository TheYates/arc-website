"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPatientByIdClient } from "@/lib/api/client";
import { getMedicationsClient } from "@/lib/api/client";
import { Patient } from "@/lib/types/patients";
import { Medication } from "@/lib/types/medications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill, Plus } from "lucide-react";

export function ReviewerMedicationsMobile({
  patientId,
}: {
  patientId: string;
}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await getPatientByIdClient(patientId);
        const meds = await getMedicationsClient(patientId);
        if (!mounted) return;
        setPatient(p || null);
        setMedications(meds || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  const active = medications.filter((m) => m.isActive);

  // Loading skeleton that doesn't include header
  if (loading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-20" />
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-foreground">
          {patient ? `${patient.firstName} ${patient.lastName}` : "—"}
        </div>
        <Button 
          asChild 
          size="sm" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
        >
          <Link href={`/reviewer/patients/medications/${patientId}`}>
            <Plus className="h-4 w-4 mr-2" /> Prescribe
          </Link>
        </Button>
      </div>

      <Card className="border-border bg-card hover:bg-card/80 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div className="font-medium text-card-foreground">Active Medications</div>
          </div>
          {active.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No active medications.
            </div>
          ) : (
            <ul className="text-sm space-y-2">
              {active.slice(0, 6).map((m) => (
                <li 
                  key={m.id} 
                  className="flex items-center justify-between p-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <span className="text-card-foreground">{m.medicationName}</span>
                  <Badge 
                    variant="outline" 
                    className="capitalize border-border bg-background text-foreground hover:bg-muted transition-colors"
                  >
                    {m.frequency.replace("_", " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
