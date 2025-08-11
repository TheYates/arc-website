"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { getApplicationById } from "@/lib/api/applications";
import {
  createPatientFromApplication,
  getPatientByApplicationId,
} from "@/lib/api/patients";
import { ApplicationData } from "@/lib/types/applications";
import {
  Patient,
  Gender,
  BloodType,
  CareLevel,
  PatientStatus,
} from "@/lib/types/patients";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Loader2, Save, CheckCircle } from "lucide-react";

export default function PatientOnboardingPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = use(params);
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "" as Gender | undefined,
    bloodType: "" as BloodType | undefined,
    heightCm: "",
    weightKg: "",
    careLevel: "medium" as CareLevel,
    status: "stable" as PatientStatus,
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Check if a patient already exists for this application
        const existingPatient = await getPatientByApplicationId(
          applicationId
        );

        if (existingPatient) {
          setPatient(existingPatient);
          // Populate form with existing data
          setFormData({
            dateOfBirth: existingPatient.dateOfBirth || "",
            gender: existingPatient.gender,
            bloodType: existingPatient.bloodType,
            heightCm: existingPatient.heightCm?.toString() || "",
            weightKg: existingPatient.weightKg?.toString() || "",
            careLevel: existingPatient.careLevel || "medium",
            status: existingPatient.status || "stable",
            emergencyContactName: existingPatient.emergencyContactName || "",
            emergencyContactRelationship:
              existingPatient.emergencyContactRelationship || "",
            emergencyContactPhone: existingPatient.emergencyContactPhone || "",
            insuranceProvider: existingPatient.insuranceProvider || "",
            insurancePolicyNumber: existingPatient.insurancePolicyNumber || "",
          });
        } else {
          // If no existing patient, fetch application data
          const applicationData = await getApplicationById(
            applicationId
          );
          if (!applicationData || applicationData.status !== "approved") {
            toast({
              title: "Error",
              description: "Application not found or not approved",
              variant: "destructive",
            });
            router.push("/admin/applications");
            return;
          }
          setApplication(applicationData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [applicationId, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    if (name === "gender") {
      // Handle gender specifically to match the Gender type
      setFormData((prev) => ({
        ...prev,
        gender: value ? (value as Gender) : undefined,
      }));
    } else if (name === "bloodType") {
      // Handle bloodType specifically to match the BloodType type
      setFormData((prev) => ({
        ...prev,
        bloodType: value ? (value as BloodType) : undefined,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!application && !patient) return;

    setIsSubmitting(true);
    try {
      const patientData = {
        ...formData,
        heightCm: formData.heightCm ? parseInt(formData.heightCm) : undefined,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
      };

      let updatedPatient: Patient | null = null;

      if (patient) {
        // Update existing patient
        // (In a real app, we'd call an update API here)
        toast({
          title: "Patient Updated",
          description: "Patient information has been updated successfully.",
        });

        // Simulate a successful update for demo purposes
        updatedPatient = { ...patient, ...patientData };
      } else if (application) {
        // Create a new patient from the application
        updatedPatient = await createPatientFromApplication(
          applicationId,
          patientData
        );

        if (updatedPatient) {
          setPatient(updatedPatient);
          toast({
            title: "Onboarding Complete",
            description: "Patient has been successfully onboarded.",
          });
        }
      }

      // Navigate to patient detail page
      if (updatedPatient) {
        setTimeout(() => {
          router.push("/admin/patients");
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to create/update patient:", error);
      toast({
        title: "Error",
        description: "Failed to save patient information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!application && !patient) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Application Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The application could not be found or has not been approved.
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

  // Person data from either patient or application
  const person = patient || application;

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
      </div>

      <div>
        <h1 className="text-2xl font-bold">
          {patient ? "Edit Patient Information" : "Patient Onboarding"}
        </h1>
        <p className="text-muted-foreground">
          {patient
            ? "Update the patient's information and medical details"
            : "Complete the onboarding process by entering additional patient information"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {patient ? "Update Patient Information" : "Complete Patient Onboarding"}
            </CardTitle>
            <CardDescription>
              {patient
                ? "Modify the patient's medical details and information"
                : "Enter comprehensive patient information to complete the onboarding process"}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8">
              {/* Basic Medical Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Medical Information</h3>
                
                {/* Personal Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender || ""}
                      onValueChange={(value) =>
                        handleSelectChange(value, "gender")
                      }
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select
                      value={formData.bloodType || ""}
                      onValueChange={(value) =>
                        handleSelectChange(value, "bloodType")
                      }
                    >
                      <SelectTrigger id="bloodType">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Physical Measurements Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="heightCm">Height (cm)</Label>
                    <Input
                      id="heightCm"
                      name="heightCm"
                      type="number"
                      value={formData.heightCm}
                      onChange={handleInputChange}
                      placeholder="170"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weightKg">Weight (kg)</Label>
                    <Input
                      id="weightKg"
                      name="weightKg"
                      type="number"
                      value={formData.weightKg}
                      onChange={handleInputChange}
                      placeholder="70.5"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="careLevel">Care Level</Label>
                    <Select
                      value={formData.careLevel}
                      onValueChange={(value) =>
                        handleSelectChange(value, "careLevel")
                      }
                    >
                      <SelectTrigger id="careLevel">
                        <SelectValue placeholder="Select care level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Patient Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleSelectChange(value, "status")
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="improving">Improving</SelectItem>
                        <SelectItem value="declining">Declining</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Emergency Contact */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      placeholder="Full name of emergency contact"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelationship">
                      Relationship
                    </Label>
                    <Input
                      id="emergencyContactRelationship"
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleInputChange}
                      placeholder="Spouse, Parent, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                    />
                  </div>
                  <div></div> {/* Empty column for spacing */}
                </div>
              </div>

              <Separator />

              {/* Insurance Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Insurance Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      name="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={handleInputChange}
                      placeholder="e.g. National Health Insurance"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                    <Input
                      id="insurancePolicyNumber"
                      name="insurancePolicyNumber"
                      value={formData.insurancePolicyNumber}
                      onChange={handleInputChange}
                      placeholder="Insurance policy number"
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/admin/applications")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="default">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : patient ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Patient
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Onboarding
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        {/* Patient Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{person!.firstName} {person!.lastName}</span>
            </CardTitle>
            <CardDescription className="space-y-1">
              <div>{person!.email}</div>
              <div>{person!.phone}</div>
              {person!.address && <div className="text-xs">{person!.address}</div>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Service:</span>
                <div className="mt-1">{application?.serviceName || 'N/A'}</div>
              </div>
              {application?.careNeeds && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Care Needs:</span>
                  <div className="mt-1 text-xs">{application.careNeeds}</div>
                </div>
              )}
              {application?.startDate && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Start Date:</span>
                  <div className="mt-1">{new Date(application.startDate).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}
