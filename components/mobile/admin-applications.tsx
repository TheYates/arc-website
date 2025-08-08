"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { getApplications } from "@/lib/api/applications";
import type { ApplicationData } from "@/lib/types/applications";

interface Props {
  title?: string;
  subtitle?: string;
}

export function AdminApplicationsMobile({
  title = "Patient Applications",
  subtitle = "Review and manage client service applications",
}: Props) {
  const router = useRouter();
  const [apps, setApps] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getApplications();
        setApps(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return apps.filter((a) => {
      const sOk = status === "all" || a.status === status;
      const tOk =
        term === "" ||
        [a.firstName, a.lastName, a.email, a.serviceName]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(term));
      return sOk && tOk;
    });
  }, [apps, q, status]);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={map[s] || ""}>{s}</Badge>;
  };

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications"
            className="pl-8"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          No applications
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <Card
              key={a.id}
              className="active:scale-[0.99] transition-transform"
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {a.firstName} {a.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.serviceName}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {formatDate(new Date(a.submittedAt))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(a.status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/applications/${a.id}`)}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
