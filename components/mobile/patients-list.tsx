"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient, CareLevel, PatientStatus } from "@/lib/types/patients";
import { Users, User, Search } from "lucide-react";

interface PatientsListMobileProps {
  patients: Patient[];
  isLoading?: boolean;
  onSelect: (patient: Patient) => void;
  emptyLabel?: string;
  title?: string;
  subtitle?: string;
}

export function PatientsListMobile({
  patients,
  isLoading,
  onSelect,
  emptyLabel = "No patients",
  title = "Patient Management",
  subtitle = "View and manage patient records",
}: PatientsListMobileProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Ensure patients is always an array
    const safePatients = Array.isArray(patients) ? patients : [];
    if (!q) return safePatients;
    return safePatients.filter((p) =>
      [p.firstName, p.lastName, p.email, p.phone, p.serviceName]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(q))
    );
  }, [patients, query]);

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients"
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8 text-sm">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 text-sm">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="active:scale-[0.99] transition-transform"
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {p.firstName} {p.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.serviceName || "—"}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {p.careLevel && (
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize"
                        >
                          {p.careLevel} care
                        </Badge>
                      )}
                      {p.status && (
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize"
                        >
                          {p.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => onSelect(p)}>
                  View
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
