"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import {
  getCareerApplicationById,
  updateCareerApplicationStatus,
  getJobPositionById,
} from "@/lib/api/careers";
import {
  CareerApplication,
  ApplicationStatus,
  JobPosition,
} from "@/lib/types/careers";
import { useAuth } from "@/lib/auth";
import {
  createAccountFromApplication,
  sendAccountCreationEmail,
  checkUserExists,
} from "@/lib/api/users";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  Paperclip,
  FileText,
  User,
  CheckCircle,
  XCircle,
  Clock,
  CalendarIcon,
  Loader2,
  UserPlus,
  Copy,
} from "lucide-react";
import { AdminCareerApplicationDetailMobile } from "@/components/mobile/admin-career-application-detail";

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [application, setApplication] = useState<CareerApplication | null>(
    null
  );
  const [jobPosition, setJobPosition] = useState<JobPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("pending");
  const [interviewDate, setInterviewDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccountCreationDialog, setShowAccountCreationDialog] =
    useState(false);
  const [showStatusUpdateDialog, setShowStatusUpdateDialog] = useState(false);
  const [accountCreationData, setAccountCreationData] = useState<{
    user: any;
    password: string;
  } | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user) return; // Wait for user to be available

      setIsLoading(true);
      try {
        const data = await getCareerApplicationById(id, user);
        setApplication(data);
        if (data?.notes) {
          setNotes(data.notes);
        }
        if (data?.status) {
          setNewStatus(data.status);
        }
        if (data?.interviewDate) {
          setInterviewDate(data.interviewDate.substring(0, 16)); // Format for datetime-local
        }

        // Fetch job position details if available
        if (data?.positionId) {
          const jobData = await getJobPositionById(data.positionId);
          setJobPosition(jobData);
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
  }, [id, user, toast]);

  const handleStatusUpdate = async () => {
    if (!application || !user) return;

    setIsSubmitting(true);
    try {
      const updatedApplication = await updateCareerApplicationStatus(
        application.id,
        newStatus,
        notes,
        user.email,
        newStatus === "interview" ? interviewDate : undefined,
        user
      );

      if (updatedApplication) {
        setApplication(updatedApplication);
        setShowStatusUpdateDialog(false);

        toast.success(`Application status updated to ${newStatus}`);

        // If status changed to "hired", show account creation option
        if (newStatus === "hired" && application.status !== "hired") {
          setShowAccountCreationDialog(true);
        }
      }
    } catch (error) {
      console.error("Failed to update application:", error);
      toast.error("Failed to update application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!application || !user) return;

    setIsCreatingAccount(true);
    try {
      // Check if user already exists
      const userExists = await checkUserExists(application.email);
      if (userExists) {
        toast({
          title: "Account Exists",
          description: "An account with this email already exists.",
          variant: "destructive",
        });
        setIsCreatingAccount(false);
        return;
      }

      // Create account
      const result = await createAccountFromApplication(
        application,
        jobPosition?.category || "Healthcare", // Default category
        user.email
      );

      if (result.success && result.user && result.password) {
        // Send email notification
        await sendAccountCreationEmail(result.user, result.password);

        setAccountCreationData({
          user: result.user,
          password: result.password,
        });

        toast({
          title: "Account Created",
          description: `Account created successfully for ${result.user.firstName} ${result.user.lastName}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-100 text-blue-800">Reviewing</Badge>;
      case "interview":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Interview Scheduled
          </Badge>
        );
      case "hired":
        return <Badge className="bg-green-100 text-green-800">Hired</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
        <Button className="mt-4" onClick={() => router.push("/admin/careers")}>
          Back to Career Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <AdminCareerApplicationDetailMobile
          id={id}
          application={application}
          jobPosition={jobPosition}
          isLoading={isLoading}
        />
      </div>

      <div className="hidden md:flex justify-between items-center">
        <Button
          variant="ghost"
          className="flex items-center"
          onClick={() => router.push("/admin/careers")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(application.status)}
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                {application.firstName} {application.lastName}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{application.email}</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{application.phone}</span>
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Position Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Position</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="font-medium text-lg">
                    {application.positionTitle || "General Application"}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {application.positionId && (
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>Job ID: {application.positionId}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Submitted: {formatDate(application.submittedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Documents Section - Show Right Away */}
              {(application.resumeUrl || application.coverLetter) && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Paperclip className="h-5 w-5 mr-2" />
                      Application Documents
                    </h3>
                    <div className="grid gap-4">
                      {/* Resume */}
                      {application.resumeUrl && (
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Resume
                            </h4>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={application.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a href={application.resumeUrl} download>
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                          {/* Check if URL looks like a real document */}
                          {application.resumeUrl.startsWith("/uploads/") ? (
                            <div className="bg-muted p-8 rounded-lg text-center">
                              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <div className="text-muted-foreground">
                                <p className="font-medium">Resume File</p>
                                <p className="text-sm mt-1">
                                  {application.resumeUrl.split("/").pop()}
                                </p>
                                <p className="text-xs mt-2 text-amber-600">
                                  📝 Preview not available - this is a demo
                                  system without file storage
                                </p>
                              </div>
                            </div>
                          ) : (
                            <iframe
                              src={application.resumeUrl}
                              className="w-full h-96 border rounded"
                              title="Resume Preview"
                            />
                          )}
                        </div>
                      )}

                      {/* Cover Letter */}
                      {application.coverLetter && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium flex items-center mb-3">
                            <FileText className="h-4 w-4 mr-2" />
                            Cover Letter
                          </h4>
                          {application.coverLetter.startsWith(
                            "Uploaded file:"
                          ) ? (
                            <div className="bg-muted p-6 rounded-lg text-center">
                              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                              <div className="text-muted-foreground">
                                <p className="font-medium">Cover Letter File</p>
                                <p className="text-sm mt-1">
                                  {application.coverLetter.replace(
                                    "Uploaded file: ",
                                    ""
                                  )}
                                </p>
                                <p className="text-xs mt-2 text-amber-600">
                                  📝 Content not available - this is a demo
                                  system without file storage
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-muted p-4 rounded-lg whitespace-pre-line text-sm leading-relaxed">
                              {application.coverLetter}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Education & Experience */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Education
                  </h3>
                  <p className="text-muted-foreground">
                    {application.education || "Not provided"}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Experience
                  </h3>
                  <p className="text-muted-foreground">
                    {application.experience || "Not provided"}
                  </p>
                </div>
              </div>

              {application.skills && application.skills.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {application.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Processing History */}
          {(application.reviewedBy || application.reviewedAt) && (
            <Card>
              <CardHeader>
                <CardTitle>Processing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.reviewedBy && (
                    <div className="flex justify-between">
                      <span className="font-medium">Reviewed By</span>
                      <span>{application.reviewedBy}</span>
                    </div>
                  )}
                  {application.reviewedAt && (
                    <div className="flex justify-between">
                      <span className="font-medium">Last Updated</span>
                      <span>{formatDate(application.reviewedAt)}</span>
                    </div>
                  )}
                  {application.interviewDate && (
                    <div className="flex justify-between">
                      <span className="font-medium">Interview Scheduled</span>
                      <span>{formatDate(application.interviewDate)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Admin Actions */}
        <div className="hidden md:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Application</CardTitle>
              <CardDescription>Change status or add notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Application Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) =>
                    setNewStatus(value as ApplicationStatus)
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Under Review</SelectItem>
                    <SelectItem value="interview">
                      Schedule Interview
                    </SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newStatus === "interview" && (
                <div className="space-y-2">
                  <Label htmlFor="interviewDate">Interview Date & Time</Label>
                  <Input
                    id="interviewDate"
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add internal notes about this application"
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setShowStatusUpdateDialog(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Application
                  </>
                )}
              </Button>

              {/* Show Create Account button if hired but no account created */}
              {application.status === "hired" && (
                <Button
                  onClick={() => setShowAccountCreationDialog(true)}
                  disabled={isCreatingAccount}
                  variant="outline"
                  className="w-full mt-2"
                >
                  {isCreatingAccount ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User Account
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a href={`mailto:${application.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </a>
              </Button>

              {application.resumeUrl && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={application.resumeUrl} download>
                    <Paperclip className="h-4 w-4 mr-2" />
                    Download Resume
                  </a>
                </Button>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-destructive/30 hover:bg-destructive/10"
                  >
                    <XCircle className="h-4 w-4 mr-2 text-destructive" />
                    <span className="text-destructive">Reject Application</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Application</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to reject this application?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Reason for rejection (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setNewStatus("rejected");
                        handleStatusUpdate();
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Confirm Rejection"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Account Creation Confirmation Dialog */}
      <Dialog
        open={showAccountCreationDialog}
        onOpenChange={setShowAccountCreationDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Create User Account
            </DialogTitle>
            <DialogDescription>
              Create a user account for {application?.firstName}{" "}
              {application?.lastName}?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span>{application?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Role:</span>
                <span className="capitalize">
                  {jobPosition?.category === "Administrative" ||
                  jobPosition?.category === "Medical Review"
                    ? "Reviewer"
                    : "Care Giver"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Position:</span>
                <span>
                  {application?.positionTitle || "General Application"}
                </span>
              </div>
            </div>

            {accountCreationData && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">
                  Account Created Successfully!
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Username:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white px-2 py-1 rounded">
                        {accountCreationData.user.username}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            accountCreationData.user.username
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Password:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white px-2 py-1 rounded">
                        {accountCreationData.password}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            accountCreationData.password
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  📧 Login credentials have been emailed to the user.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                {accountCreationData ? "Close" : "Cancel"}
              </Button>
            </DialogClose>
            {!accountCreationData && (
              <Button
                onClick={handleCreateAccount}
                disabled={isCreatingAccount}
              >
                {isCreatingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Confirmation Dialog */}
      <Dialog
        open={showStatusUpdateDialog}
        onOpenChange={setShowStatusUpdateDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update the application status to "
              {newStatus}"?
              {newStatus === "hired" &&
                " This will mark the candidate as hired."}
              {newStatus === "rejected" && " This will reject the application."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleStatusUpdate}
              disabled={isSubmitting}
              variant={newStatus === "rejected" ? "destructive" : "default"}
            >
              {isSubmitting ? "Updating..." : "Confirm Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
