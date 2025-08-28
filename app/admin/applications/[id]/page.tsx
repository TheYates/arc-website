"use client";

import * as React from "react";
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
import { AdminApplicationDetailMobile } from "@/components/mobile/admin-application-detail";
import { InvoiceManagement } from "@/components/admin/invoice-management";
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
  Send,
  MessageSquare,
  FileText,
  Plus,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchApplication = async () => {
      setIsLoading(true);
      try {
        const data = await getApplicationById(id, user);
        console.log("Application data:", data); // Debug log
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
  }, [id, toast]);

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    if (!application || !user) return;

    setIsSubmitting(true);
    try {
      const updatedApplication = await updateApplicationStatus(
        application.id,
        status,
        adminNotes,
        user.email,
        user
      );

      if (updatedApplication) {
        setApplication(updatedApplication);

        if (status === "approved") {
          // Handle approval response with user creation and notifications
          const data = updatedApplication as any;

          let notificationStatus = "";
          if (data.notifications) {
            const emailStatus = data.notifications.email.success ? "✅" : "❌";
            const smsStatus = data.notifications.sms.success ? "✅" : "❌";
            notificationStatus = ` | Email: ${emailStatus} SMS: ${smsStatus}`;
          }

          toast({
            title: "Application Approved & Account Created",
            description: `User account created for ${application.firstName} ${application.lastName}. Credentials sent via email and SMS.${notificationStatus}`,
            variant: "default",
          });

          // Don't navigate to onboarding - the new flow handles everything
        } else {
          toast({
            title: "Application Rejected",
            description: "The application has been successfully rejected.",
            variant: "destructive",
          });
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

  const handleResendCredentials = async (method: 'email' | 'sms' | 'both' = 'both') => {
    if (!application) return;

    setIsResending(true);
    try {
      const response = await fetch(`/api/admin/applications/${application.id}/resend-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Credentials Resent",
          description: `Credentials have been resent via ${method}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to resend credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to resend credentials:", error);
      toast({
        title: "Error",
        description: "Failed to resend credentials",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!application) return;

    setIsCreatingInvoice(true);
    try {
      const response = await fetch(`/api/admin/applications/${application.id}/create-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          basePrice: 500, // Default price - can be customized
          currency: 'GHS',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Invoice Created",
          description: `Invoice ${data.invoice.invoiceNumber} created successfully`,
          variant: "default",
        });

        // Refresh the application data to show the new invoice
        const updatedApp = await getApplicationById(application.id);
        if (updatedApp) {
          setApplication(updatedApp);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create invoice",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
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
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <AdminApplicationDetailMobile id={id} />
      </div>

      <div className="hidden md:flex justify-between items-center">
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

      <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6">
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

              {/* Selected Optional Features */}
              {application.selectedFeatures && application.selectedFeatures.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Selected Optional Features
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {application.selectedFeatures.map((feature) => (
                        <Badge key={feature.id} variant="outline">
                          {feature.featureName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Invoice Management */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>
                Create and manage invoices for this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceManagement
                application={application}
                onInvoiceCreated={(invoice) => {
                  // Update the application state to include the new invoice
                  setApplication(prev => prev ? {
                    ...prev,
                    invoices: [...(prev.invoices || []), invoice]
                  } : null);
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="hidden md:block space-y-6">
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
                          Approving this application will create a user account,
                          generate temporary credentials, and send welcome notifications
                          via email and SMS to the applicant.
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
                        <div className="mt-4 p-3 border border-gray-800 rounded-lg">
                          <h4 className="font-medium  mb-2">What will happen:</h4>
                          <ul className="text-sm  space-y-1">
                            <li>✓ User account will be created</li>
                            <li>✓ Temporary password will be generated</li>
                            <li>✓ Welcome email will be sent with login credentials</li>
                            <li>✓ SMS notification will be sent with credentials</li>
                            <li>✓ User can login to view invoice and make payment</li>
                          </ul>
                        </div>
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
                              Creating Account & Sending Notifications...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve & Create Account
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
                    <div className="mt-4 space-y-3">
                      {/* Show temporary password for testing */}
                      {application.tempPassword ? (
                        <div className=" border border-gray-700 rounded-lg p-4">
                          <h4 className="font-medium  text-sm mb-3 flex items-center gap-2">
                            🔑 User Login Credentials
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className=" font-medium">Email:</span>
                                <code className=" px-2 py-1 rounded ">{application.email}</code>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(application.email, "Email")}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className=" font-medium">Password:</span>
                                <code className=" px-2 py-1 rounded ">
                                  {showPassword ? application.tempPassword : '••••••••••'}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="h-6 w-6 p-0"
                                >
                                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(application.tempPassword || "", "Password")}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                         
                        </div>
                      ) : (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <h4 className="font-medium text-orange-800 text-sm mb-2">⚠️ No Credentials Found</h4>
                          <p className="text-sm text-orange-700 mb-3">
                            This application was approved but no temporary password was generated.
                            This usually happens with applications approved before the new credential system.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendCredentials('both')}
                            disabled={isResending}
                            className="w-full"
                          >
                            {isResending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Generate & Send Credentials
                          </Button>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <h4 className="font-medium text-sm mb-3">Credential Management</h4>
                        <div className="grid grid-cols-1 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendCredentials('both')}
                            disabled={isResending}
                            className="w-full"
                          >
                            {isResending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Resend All Credentials
                          </Button>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendCredentials('email')}
                              disabled={isResending}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Email Only
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendCredentials('sms')}
                              disabled={isResending}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              SMS Only
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
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
