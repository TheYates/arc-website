"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export function ServiceRequestDialog({ onSuccess, trigger }: ServiceRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if (open) {
      fetchServiceTypes();
    }
  }, [open]);

  const fetchServiceTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/service-types?isActive=true&popular=true");
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
    const selectedType = serviceTypes.find(type => type.id === serviceTypeId);
    setFormData(prev => ({
      ...prev,
      serviceTypeId,
      title: selectedType ? selectedType.name : prev.title,
      description: selectedType ? selectedType.description : prev.description,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      customDescription: "",
      priority: "MEDIUM",
      preferredDate: "",
      estimatedDuration: "",
      notes: "",
      serviceTypeId: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in the title and description");
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
          ...formData,
          preferredDate: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : null,
          estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null,
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
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Service Request</DialogTitle>
          <DialogDescription>
            Request a service from your assigned caregiver
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type (Optional)</Label>
            <Select
              value={formData.serviceTypeId}
              onValueChange={handleServiceTypeChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a common service type or create custom" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose from common services or leave blank to create a custom request
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, customDescription: e.target.value }))}
              placeholder="Any specific instructions or additional information..."
              rows={2}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low - Can wait a few days</SelectItem>
                <SelectItem value="MEDIUM">Medium - Within 24 hours</SelectItem>
                <SelectItem value="HIGH">High - Same day preferred</SelectItem>
                <SelectItem value="CRITICAL">Critical - Urgent attention needed</SelectItem>
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
              onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-sm text-muted-foreground">
              When would you prefer this service to be provided?
            </p>
          </div>

          {/* Estimated Duration */}
          <div className="space-y-2">
            <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
            <Input
              id="estimatedDuration"
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any other information your caregiver should know..."
              rows={2}
            />
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
