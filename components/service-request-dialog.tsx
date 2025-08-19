"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ServiceType {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface ServiceRequestDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ServiceRequestDialog({
  onSuccess,
  trigger,
}: ServiceRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceTypeId: "",
    description: "",
    priority: "MEDIUM",
  });

  useEffect(() => {
    if (open) {
      fetchServiceTypes();
    }
  }, [open]);

  const fetchServiceTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/service-types?isActive=true&popular=true"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch service types");
      }
      const data = await response.json();
      setServiceTypes(data.serviceTypes);
    } catch (error) {
      console.error("Error fetching service types:", error);
      toast.error("Failed to load service types");
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceTypeChange = (serviceTypeId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceTypeId,
    }));
  };

  const resetForm = () => {
    setFormData({
      serviceTypeId: "",
      description: "",
      priority: "MEDIUM",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceTypeId) {
      toast.error("Please select a service type");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceTypeId:
            formData.serviceTypeId === "other" ? null : formData.serviceTypeId,
          title:
            formData.serviceTypeId === "other"
              ? "Other Service Request"
              : serviceTypes.find((type) => type.id === formData.serviceTypeId)
                  ?.name || "Service Request",
          description: formData.description,
          priority: formData.priority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create service request");
      }

      const data = await response.json();

      toast.success("Service request created successfully", {
        description: "Your caregiver will be notified about your request.",
      });

      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating service request:", error);
      toast.error("Failed to create service request", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      New Request
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Service Request</DialogTitle>
          <DialogDescription>
            Request a service from your assigned caregiver
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select
              value={formData.serviceTypeId}
              onValueChange={handleServiceTypeChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service type" />
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
                <SelectItem value="other">
                  <div>
                    <div className="font-medium">Other</div>
                    <div className="text-sm text-muted-foreground">
                      Custom service request
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
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
                <SelectItem value="LOW">Low - Can wait a few days</SelectItem>
                <SelectItem value="MEDIUM">Medium - Within 24 hours</SelectItem>
                <SelectItem value="HIGH">High - Same day preferred</SelectItem>
                <SelectItem value="CRITICAL">
                  Critical - Urgent attention needed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
