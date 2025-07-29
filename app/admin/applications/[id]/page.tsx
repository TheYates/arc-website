"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  getApplicationById,
  updateApplicationStatus,
} from "@/lib/api/applications";
import { ApplicationData } from "@/lib/types/applications";
import { useAuth } from "@/lib/auth";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  ClipboardCheck,
  ClipboardList,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

export default function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchApplication = async () => {
      setIsLoading(true);
      try {
        const data = await getApplicationById(params.id);
        setApplication(data);
        if (data?.adminNotes) {
          setAdminNotes(data.adminNotes);
        }
      } catch (error) {
        console.error("Failed to fetch application:", error);
        toast({
          title: "Error",
          description: "Failed to load application details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [params.id, toast]);

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    if (!application || !user) return;

    setIsSubmitting(true);
    try {
      const updatedApplication = await updateApplicationStatus(
        application.id,
        status,
        adminNotes,
        user.email
      );

      if (updatedApplication) {
        setApplication(updatedApplication);

        toast({
          title: `Application ${
            status === "approved" ? "Approved" : "Rejected"
          }`,
          description: `The application has been successfully ${status}.`,
          variant: status === "approved" ? "default" : "destructive",
        });

        // If approved, navigate to the onboarding page
        if (status === "approved") {
          router.push(`/admin/patients/onboard/${application.id}`);
        }
      }
    } catch (error) {
      console.error(`Failed to ${status} application:`, error);
      toast({
        title: "Error",
        description: `Failed to ${status} application`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800">Pending Review</Badge>
        );
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Application Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The application could not be found or has been deleted.
        </p>
        <Button
          className="mt-4"
          onClick={() => router.push("/admin/applications")}
        >
          Back to Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          className="flex items-center"
          onClick={() => router.push("/admin/applications")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
        {getStatusBadge(application.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {application.firstName} {application.lastName}
              </CardTitle>
              <CardDescription>
                Application submitted on {formatDate(application.submittedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Contact Information
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{application.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{application.phone}</span>
                    </div>
                    {application.address && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{application.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Service Requested
                  </h3>
                  <div className="mt-2">
                    <div className="font-semibold">
                      {application.serviceName}
                    </div>
                    {application.startDate && (
                      <div className="flex items-center mt-2">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          Start date: {formatDate(application.startDate)}
                        </span>
                      </div>
                    )}
                    {application.duration && (
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Duration: {application.duration}</span>
                      </div>
                    )}
                    {application.preferredContact && (
                      <div className="mt-1">
                        <span className="text-sm text-muted-foreground">
                          Preferred contact: {application.preferredContact}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {application.careNeeds && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Care Needs
                    </h3>
                    <p className="mt-2 whitespace-pre-line">
                      {application.careNeeds}
                    </p>
                  </div>
                </>
              )}

              {application.processedAt && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Processing Information
                    </h3>
                    <div className="mt-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Processed by:
                        </span>{" "}
                        <span>{application.processedBy}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Processed on:
                        </span>{" "}
                        <span>{formatDate(application.processedAt)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="adminNotes"
                  className="block text-sm font-medium mb-1"
                >
                  Admin Notes
                </label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  rows={4}
                  disabled={application.status !== "pending"}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {application.status === "pending" ? (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="default">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Application
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Application</DialogTitle>
                        <DialogDescription>
                          Approving this application will start the onboarding
                          process for this patient.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p>
                          You are approving the application for{" "}
                          <strong>
                            {application.firstName} {application.lastName}
                          </strong>{" "}
                          for {application.serviceName} service.
                        </p>
                        <p className="mt-2">
                          After approval, you'll be taken to the patient
                          onboarding page to complete the process.
                        </p>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          onClick={() => handleStatusUpdate("approved")}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve & Continue to Onboarding
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-destructive/30 hover:bg-destructive/10"
                      >
                        <XCircle className="h-4 w-4 mr-2 text-destructive" />
                        <span className="text-destructive">
                          Reject Application
                        </span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Application</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject this application? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <p className="font-medium">
                          Application from{" "}
                          <strong>
                            {application.firstName} {application.lastName}
                          </strong>
                        </p>
                        {!adminNotes && (
                          <p className="mt-2 text-amber-600 text-sm">
                            Consider adding admin notes to document the reason
                            for rejection.
                          </p>
                        )}
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleStatusUpdate("rejected")}
                          disabled={isSubmitting}
                        >
                          {isSubmitting
                            ? "Processing..."
                            : "Reject Application"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">
                    This application has already been{" "}
                    <span className="font-semibold">
                      {application.status === "approved"
                        ? "approved"
                        : "rejected"}
                    </span>
                  </p>
                  {application.status === "approved" && (
                    <Button
                      className="mt-4 w-full"
                      onClick={() =>
                        router.push(`/admin/patients/onboard/${application.id}`)
                      }
                    >
                      Continue to Patient Onboarding
                    </Button>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
