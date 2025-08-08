"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getPatientsByReviewer } from "@/lib/api/assignments";
import type { Patient } from "@/lib/types/patients";
import { PatientsListMobile } from "@/components/mobile/patients-list";

export function ReviewerPatientsMobile() {
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
        const data = await getPatientsByReviewer(user.id);
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
      onSelect={(p) => router.push(`/reviewer/patients/${p.id}`)}
      emptyLabel="No assigned patients"
    />
  );
}
