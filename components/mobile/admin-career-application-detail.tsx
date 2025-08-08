"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  getCareerApplicationById,
  updateCareerApplicationStatus,
  getJobPositionById,
} from "@/lib/api/careers";
import type {
  CareerApplication,
  ApplicationStatus,
  JobPosition,
} from "@/lib/types/careers";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Paperclip,
  FileText,
} from "lucide-react";

export function AdminCareerApplicationDetailMobile({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [app, setApp] = useState<CareerApplication | null>(null);
  const [job, setJob] = useState<JobPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ApplicationStatus>("pending");
  const [notes, setNotes] = useState("");
  const [interviewAt, setInterviewAt] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getCareerApplicationById(id);
        setApp(data || null);
        if (data) {
          setStatus(data.status);
          setNotes(data.notes || "");
          if (data.interviewDate)
            setInterviewAt(data.interviewDate.substring(0, 16));
          if (data.positionId) {
            const jp = await getJobPositionById(data.positionId);
            setJob(jp || null);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const badge = (s: ApplicationStatus) => {
    const map: Record<ApplicationStatus, string> = {
      pending: "bg-amber-100 text-amber-800",
      reviewing: "bg-blue-100 text-blue-800",
      interview: "bg-purple-100 text-purple-800",
      hired: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={map[s]}>{s}</Badge>;
  };

  const handleUpdate = async () => {
    if (!app || !user) return;
    setUpdating(true);
    try {
      const updated = await updateCareerApplicationStatus(
        app.id,
        status,
        notes,
        user.email,
        status === "interview" ? interviewAt : undefined
      );
      setApp(updated);
    } finally {
      setUpdating(false);
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
              onClick={() => router.push("/admin/careers")}
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
        <h1 className="text-2xl font-bold">Career Application</h1>
        <p className="text-sm text-muted-foreground">
          Review job application and manage candidate status
        </p>
      </div>

      <Button
        variant="ghost"
        onClick={() => router.push("/admin/careers")}
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
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2" />
            {app.email}
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2" />
            {app.phone}
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            Submitted {formatDate(new Date(app.submittedAt))}
          </div>
          <div className="mt-2">
            <div className="font-medium">
              {app.positionTitle || "General Application"}
            </div>
            {app.positionId && (
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <Briefcase className="h-3 w-3 mr-1" />
                Job ID: {app.positionId}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {(app.resumeUrl || app.coverLetter) && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="font-medium flex items-center">
              <Paperclip className="h-4 w-4 mr-2" />
              Documents
            </div>
            {app.resumeUrl && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Resume
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={app.resumeUrl} download>
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            )}
            {app.coverLetter && (
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {app.coverLetter.startsWith("Uploaded file:")
                  ? app.coverLetter
                  : app.coverLetter}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-medium">Update Status</div>
          <div className="grid grid-cols-1 gap-2">
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ApplicationStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {status === "interview" && (
              <Input
                type="datetime-local"
                value={interviewAt}
                onChange={(e) => setInterviewAt(e.target.value)}
              />
            )}
            <Textarea
              rows={4}
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? "Updating..." : "Update"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 grid grid-cols-2 gap-2">
          <Button asChild variant="outline">
            <a href={`mailto:${app.email}`}>Email</a>
          </Button>
          {app.resumeUrl && (
            <Button asChild variant="outline">
              <a href={app.resumeUrl} download>
                Resume
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
