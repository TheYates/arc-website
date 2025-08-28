"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  getApplicationById,
  updateApplicationStatus,
} from "@/lib/api/applications";
import type { ApplicationData } from "@/lib/types/applications";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";

export function AdminApplicationDetailMobile({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [app, setApp] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getApplicationById(id, user);
        setApp(data || null);
        if (data?.adminNotes) setAdminNotes(data.adminNotes);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const badge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={map[s] || ""}>{s}</Badge>;
  };

  const doUpdate = async (status: "approved" | "rejected") => {
    if (!app || !user) return;
    setSubmitting(true);
    try {
      const updated = await updateApplicationStatus(
        app.id,
        status,
        adminNotes,
        user.email,
        user
      );
      setApp(updated);
      if (status === "approved") {
        router.push(`/admin/patients/onboard/${app.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="px-4 py-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (!app)
    return (
      <div className="px-4 py-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2 font-medium">Application not found</div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/applications")}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Application Detail</h1>
        <p className="text-sm text-muted-foreground">
          Review candidate application and take action
        </p>
      </div>
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/applications")}
        className="px-0"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="flex items-center justify-between">
        <div className="font-semibold">
          {app.firstName} {app.lastName}
        </div>
        {badge(app.status)}
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="text-sm text-muted-foreground">
            Submitted {formatDate(new Date(app.submittedAt))}
          </div>
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2" />
            {app.email}
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2" />
            {app.phone}
          </div>
          {app.address && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2" />
              {app.address}
            </div>
          )}
          <div className="mt-2">
            <div className="font-medium">Service</div>
            <div className="text-sm">{app.serviceName}</div>
            {app.startDate && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                Start {formatDate(new Date(app.startDate))}
              </div>
            )}
            {app.duration && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {app.duration}
              </div>
            )}
            {app.preferredContact && (
              <div className="text-xs text-muted-foreground mt-1">
                Preferred contact: {app.preferredContact}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {app.careNeeds && (
        <Card>
          <CardContent className="p-4">
            <div className="font-medium mb-1">Care Needs</div>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {app.careNeeds}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-medium">Update Status</div>
          <Textarea
            rows={4}
            placeholder="Admin notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            disabled={app.status !== "pending"}
          />
          {app.status === "pending" ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => doUpdate("approved")}
                disabled={submitting}
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button
                variant="outline"
                className="border-destructive/30"
                onClick={() => doUpdate("rejected")}
                disabled={submitting}
              >
                <XCircle className="h-4 w-4 mr-2 text-destructive" />
                <span className="text-destructive">Reject</span>
              </Button>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Already {app.status}.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
