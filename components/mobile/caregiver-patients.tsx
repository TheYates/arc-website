"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getPatientsByCaregiverClient } from "@/lib/api/client";
import type { Patient } from "@/lib/types/patients";
import { PatientsListMobile } from "@/components/mobile/patients-list";

export function CaregiverPatientsMobile() {
  const { user } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await getPatientsByCaregiverClient(user.id);
        if (mounted) setPatients(data);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <PatientsListMobile
      patients={patients}
      isLoading={isLoading}
      onSelect={(p) => router.push(`/caregiver/patients/${p.id}`)}
      emptyLabel="No assigned patients"
    />
  );
}
