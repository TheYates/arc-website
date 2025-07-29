"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart,
  Users,
  Clock,
  Award,
  Loader2,
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
} from "lucide-react";
import {
  getPublishedJobPositions,
  createCareerApplication,
} from "@/lib/api/careers";
import { JobPosition } from "@/lib/types/careers";

export default function CareersPage() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGeneralApplicationDialog, setShowGeneralApplicationDialog] =
    useState(false);
  const [showJobApplicationDialog, setShowJobApplicationDialog] =
    useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [applicationData, setApplicationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    resumeFile: null as File | null,
    coverLetterFile: null as File | null,
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobs = await getPublishedJobPositions();
        setPositions(jobs);
      } catch (error) {
        console.error("Failed to fetch job positions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleGeneralApplicationSubmit = async () => {
    try {
      if (
        !applicationData.firstName ||
        !applicationData.lastName ||
        !applicationData.email
      ) {
        alert("Please fill in required fields (Name and Email)");
        return;
      }

      setIsSubmitting(true);

      // For now, we'll store file names (in a real app, you'd upload to a file server)
      const resumeUrl = applicationData.resumeFile
        ? `/uploads/${applicationData.resumeFile.name}`
        : undefined;
      const coverLetterText = applicationData.coverLetterFile
        ? `Uploaded file: ${applicationData.coverLetterFile.name}`
        : "I am writing to express my strong interest in joining your team. With my background and passion for providing excellent care, I believe I would be a valuable addition to your organization. I am committed to delivering compassionate, professional service and would welcome the opportunity to discuss how my skills can contribute to your mission.";

      await createCareerApplication({
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        phone: applicationData.phone,
        resumeUrl: resumeUrl,
        coverLetter: coverLetterText,
        // General application - no specific position
      });

      // Reset form and close dialog
      setApplicationData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        resumeFile: null,
        coverLetterFile: null,
      });
      setShowGeneralApplicationDialog(false);

      // Show success dialog
      setSuccessMessage(
        "Thank you! Your general application has been submitted successfully."
      );
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert(
        "There was an error submitting your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJobApplicationSubmit = async () => {
    try {
      if (
        !applicationData.firstName ||
        !applicationData.lastName ||
        !applicationData.email ||
        !selectedJob
      ) {
        alert("Please fill in required fields (Name and Email)");
        return;
      }

      setIsSubmitting(true);

      // For now, we'll store file names (in a real app, you'd upload to a file server)
      const resumeUrl = applicationData.resumeFile
        ? `/uploads/${applicationData.resumeFile.name}`
        : undefined;
      const coverLetterText = applicationData.coverLetterFile
        ? `Uploaded file: ${applicationData.coverLetterFile.name}`
        : "I am excited to apply for this position. My experience and dedication to providing quality care make me an ideal candidate. I am eager to contribute to your team and would appreciate the opportunity to discuss how my skills align with your needs.";

      await createCareerApplication({
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        phone: applicationData.phone,
        resumeUrl: resumeUrl,
        coverLetter: coverLetterText,
        positionId: selectedJob.id,
        positionTitle: selectedJob.title,
      });

      // Reset form and close dialog
      const jobTitle = selectedJob.title;
      setApplicationData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        resumeFile: null,
        coverLetterFile: null,
      });
      setShowJobApplicationDialog(false);
      setSelectedJob(null);

      // Show success dialog
      setSuccessMessage(
        `Thank you! Your application for ${jobTitle} has been submitted successfully.`
      );
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert(
        "There was an error submitting your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyToJob = (job: JobPosition) => {
    setSelectedJob(job);
    setShowJobApplicationDialog(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Join Our Care Team
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            Make a difference in families' lives while building a rewarding
            career in healthcare and childcare.
          </p>
          <Button
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8"
          >
            Apply Now
          </Button>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Work With Alpha Rescue Consult?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Meaningful Work
                </h3>
                <p className="text-slate-600">
                  Make a real difference in families' lives every day
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Supportive Team
                </h3>
                <p className="text-slate-600">
                  Work with experienced professionals who care
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Flexible Schedule
                </h3>
                <p className="text-slate-600">
                  Choose from full-time, part-time, or contract work
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Professional Growth
                </h3>
                <p className="text-slate-600">
                  Continuous training and career development
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Current Openings
            </h2>
            <p className="text-xl text-slate-600">
              Join our team of dedicated care professionals
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No Openings Available
              </h3>
              <p className="text-slate-600 mb-6">
                We don't have any open positions at the moment, but we're always
                looking for talented professionals.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="border-teal-600 text-teal-600"
                onClick={() => setShowGeneralApplicationDialog(true)}
              >
                Submit General Application
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {positions.map((position) => (
                <Card
                  key={position.id}
                  className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="mb-2">
                      <CardTitle className="text-lg text-slate-900 mb-2">
                        {position.title}
                      </CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-slate-600">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {position.type}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {position.location}
                        </div>
                        <div className="flex items-center text-sm font-semibold text-teal-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {position.salary}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{position.category}</Badge>
                          {position.numberOfPositions &&
                            position.numberOfPositions > 1 && (
                              <Badge variant="secondary">
                                {position.numberOfPositions} positions
                              </Badge>
                            )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                      {position.description}
                    </p>

                    {position.requirements &&
                      position.requirements.length > 0 && (
                        <div className="flex-1 mb-4">
                          <h4 className="font-semibold text-slate-900 mb-2 text-sm">
                            Requirements:
                          </h4>
                          <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
                            {position.requirements.map((req, reqIndex) => (
                              <li key={reqIndex}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {position.benefits && position.benefits.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-slate-900 mb-2 text-sm">
                          Benefits:
                        </h4>
                        <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
                          {position.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {position.remoteWorkOptions && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-slate-900 mb-1 text-sm">
                          Remote Work:
                        </h4>
                        <p className="text-slate-600 text-sm">
                          {position.remoteWorkOptions}
                        </p>
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-200">
                      <Button
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => handleApplyToJob(position)}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Additional CTA */}
          <div className="text-center mt-16">
            <div className="bg-slate-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Don't See Your Perfect Role?
              </h3>
              <p className="text-slate-600 mb-6">
                We're always looking for passionate healthcare and childcare
                professionals. Send us your resume and we'll keep you in mind
                for future opportunities.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="border-teal-600 text-teal-600"
                onClick={() => setShowGeneralApplicationDialog(true)}
              >
                Submit General Application
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* General Application Dialog */}
      <Dialog
        open={showGeneralApplicationDialog}
        onOpenChange={setShowGeneralApplicationDialog}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Submit General Application
            </DialogTitle>
            <DialogDescription>
              Tell us about yourself and your interest in joining our team.
              We'll keep your information on file for future opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={applicationData.firstName}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={applicationData.lastName}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={applicationData.email}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={applicationData.phone}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="resume">Resume (PDF, DOC, DOCX)</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setApplicationData({
                    ...applicationData,
                    resumeFile: file,
                  });
                }}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>

            <div>
              <Label htmlFor="coverLetter">Cover Letter (PDF, DOC, DOCX)</Label>
              <Input
                id="coverLetter"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setApplicationData({
                    ...applicationData,
                    coverLetterFile: file,
                  });
                }}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGeneralApplicationDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGeneralApplicationSubmit}
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job-Specific Application Dialog */}
      <Dialog
        open={showJobApplicationDialog}
        onOpenChange={setShowJobApplicationDialog}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Apply for {selectedJob?.title}
            </DialogTitle>
            <DialogDescription>
              Submit your application for this position. We'll review your
              information and get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job-firstName">First Name *</Label>
                <Input
                  id="job-firstName"
                  value={applicationData.firstName}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="job-lastName">Last Name *</Label>
                <Input
                  id="job-lastName"
                  value={applicationData.lastName}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job-email">Email *</Label>
                <Input
                  id="job-email"
                  type="email"
                  value={applicationData.email}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="job-phone">Phone</Label>
                <Input
                  id="job-phone"
                  value={applicationData.phone}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="job-resume">Resume (PDF, DOC, DOCX)</Label>
              <Input
                id="job-resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setApplicationData({
                    ...applicationData,
                    resumeFile: file,
                  });
                }}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>

            <div>
              <Label htmlFor="job-coverLetter">
                Cover Letter (PDF, DOC, DOCX)
              </Label>
              <Input
                id="job-coverLetter"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setApplicationData({
                    ...applicationData,
                    coverLetterFile: file,
                  });
                }}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>

            {/* Show Job Details */}
            {selectedJob && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Position Details:
                </h4>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    <strong>Location:</strong> {selectedJob.location}
                  </p>
                  <p>
                    <strong>Type:</strong> {selectedJob.type}
                  </p>
                  <p>
                    <strong>Salary:</strong> {selectedJob.salary}
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedJob.category}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowJobApplicationDialog(false);
                setSelectedJob(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJobApplicationSubmit}
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
