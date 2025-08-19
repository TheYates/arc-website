"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPatients } from "@/lib/api/patients";
import type { Patient } from "@/lib/types/patients";
import { PatientsListMobile } from "@/components/mobile/patients-list";

export function AdminPatientsMobile() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const response = await getPatients(1, 50);
        if (mounted) setPatients(response.patients);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PatientsListMobile
      patients={patients}
      isLoading={isLoading}
      onSelect={(p) => router.push(`/admin/patients/${p.id}`)}
      emptyLabel="No patients found"
    />
  );
}
