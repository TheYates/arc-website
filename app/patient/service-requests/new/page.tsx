"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { RoleHeader } from "@/components/role-header";
import { authenticatedGet, authenticatedPost } from "@/lib/api/auth-headers";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface ServiceType {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function NewServiceRequestPage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    customDescription: "",
    priority: "MEDIUM",
    preferredDate: "",
    estimatedDuration: "",
    notes: "",
    serviceTypeId: "",
  });

  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "patient") {
        router.push("/");
        return;
      }
      fetchServiceTypes();
    }
  }, [user, authLoading, router]);

  const fetchServiceTypes = async () => {
    try {
      const response = await authenticatedGet(
        "/api/service-types?isActive=true&popular=true",
        user
      );
      if (!response.ok) {
        throw new Error("Failed to fetch service types");
      }
      const data = await response.json();
      setServiceTypes(data.serviceTypes);
    } catch (error) {
      console.error("Error fetching service types:", error);
      toast({
        title: "Error",
        description: "Failed to load service types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceTypeChange = (serviceTypeId: string) => {
    const selectedType = serviceTypes.find((type) => type.id === serviceTypeId);
    setFormData((prev) => ({
      ...prev,
      serviceTypeId,
      title: selectedType ? selectedType.name : prev.title,
      description: selectedType ? selectedType.description : prev.description,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in the title",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authenticatedPost("/api/service-requests", user, {
        ...formData,
        preferredDate: formData.preferredDate
          ? new Date(formData.preferredDate).toISOString()
          : null,
        estimatedDuration: formData.estimatedDuration
          ? parseInt(formData.estimatedDuration)
          : null,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create service request");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: "Service request created successfully",
      });

      router.push("/patient/service-requests");
    } catch (error: any) {
      console.error("Error creating service request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="patient" />
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-background">
        <RoleHeader role="patient" />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="text-muted-foreground">
              Access denied. Patient role required.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleHeader role="patient" />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/patient/service-requests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Service Request</CardTitle>
            <CardDescription>
              Request a service from your assigned caregiver
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type (Optional)</Label>
                <Select
                  value={formData.serviceTypeId}
                  onValueChange={handleServiceTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a common service type or create custom" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose from common services or leave blank to create a custom
                  request
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Wound dressing change, Medication assistance"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe what you need help with..."
                  rows={3}
                  required
                />
              </div>

              {/* Custom Description */}
              <div className="space-y-2">
                <Label htmlFor="customDescription">Additional Details</Label>
                <Textarea
                  id="customDescription"
                  value={formData.customDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customDescription: e.target.value,
                    }))
                  }
                  placeholder="Any specific instructions or additional information..."
                  rows={2}
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      Low - Can wait a few days
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      Medium - Within 24 hours
                    </SelectItem>
                    <SelectItem value="HIGH">
                      High - Same day preferred
                    </SelectItem>
                    <SelectItem value="CRITICAL">
                      Critical - Urgent attention needed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Date */}
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Date & Time</Label>
                <Input
                  id="preferredDate"
                  type="datetime-local"
                  value={formData.preferredDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredDate: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-sm text-muted-foreground">
                  When would you prefer this service to be provided?
                </p>
              </div>

              {/* Estimated Duration */}
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">
                  Estimated Duration (minutes)
                </Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedDuration: e.target.value,
                    }))
                  }
                  placeholder="e.g., 30"
                  min="1"
                  max="480"
                />
                <p className="text-sm text-muted-foreground">
                  How long do you think this service will take?
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Any other information your caregiver should know..."
                  rows={2}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Request...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Request
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/patient/service-requests">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
