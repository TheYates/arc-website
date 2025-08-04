"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Service } from "@/lib/api/services-sqlite";
import { Loader2 } from "lucide-react";
import ServiceHierarchyEditor from "./service-hierarchy-editor";

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  service?: Service | null;
  mode: "create" | "edit";
}

export default function ServiceFormModal({
  isOpen,
  onClose,
  onSuccess,
  service,
  mode,
}: ServiceFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [showHierarchyEditor, setShowHierarchyEditor] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    displayName: "",
    description: "",
    shortDescription: "",
    category: "home_care" as "home_care" | "nanny" | "emergency" | "custom",
    basePriceDaily: "",
    basePriceMonthly: "",
    basePriceHourly: "",
    priceDisplay: "",
    isActive: true,
    isPopular: false,
    sortOrder: "0",
    colorTheme: "teal",
    icon: "",
  });

  useEffect(() => {
    if (service && mode === "edit") {
      setFormData({
        name: service.name,
        slug: service.slug,
        displayName: service.displayName,
        description: service.description || "",
        shortDescription: service.shortDescription || "",
        category: service.category,
        basePriceDaily: service.basePriceDaily?.toString() || "",
        basePriceMonthly: service.basePriceMonthly?.toString() || "",
        basePriceHourly: service.basePriceHourly?.toString() || "",
        priceDisplay: service.priceDisplay || "",
        isActive: service.isActive,
        isPopular: service.isPopular,
        sortOrder: service.sortOrder.toString(),
        colorTheme: service.colorTheme,
        icon: service.icon || "",
      });
    } else if (mode === "create") {
      // Reset form for create mode
      setFormData({
        name: "",
        slug: "",
        displayName: "",
        description: "",
        shortDescription: "",
        category: "home_care",
        basePriceDaily: "",
        basePriceMonthly: "",
        basePriceHourly: "",
        priceDisplay: "",
        isActive: true,
        isPopular: false,
        sortOrder: "0",
        colorTheme: "teal",
        icon: "",
      });
    }
  }, [service, mode, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
      displayName: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        displayName: formData.displayName,
        description: formData.description || undefined,
        shortDescription: formData.shortDescription || undefined,
        category: formData.category,
        basePriceDaily: formData.basePriceDaily
          ? parseFloat(formData.basePriceDaily)
          : undefined,
        basePriceMonthly: formData.basePriceMonthly
          ? parseFloat(formData.basePriceMonthly)
          : undefined,
        basePriceHourly: formData.basePriceHourly
          ? parseFloat(formData.basePriceHourly)
          : undefined,
        priceDisplay: formData.priceDisplay || undefined,
        isActive: formData.isActive,
        isPopular: formData.isPopular,
        sortOrder: parseInt(formData.sortOrder),
        colorTheme: formData.colorTheme,
        icon: formData.icon || undefined,
      };

      const url =
        mode === "create" ? "/api/services" : `/api/services/${service?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Error saving service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Service" : "Edit Service"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new service to your offerings"
              : "Update the service information"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., AHENEFIE"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="e.g., ahenefie"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                placeholder="e.g., AHENEFIE"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shortDescription: e.target.value,
                  }))
                }
                placeholder="e.g., Live-in home care package"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Detailed description of the service..."
                rows={4}
              />
            </div>
          </div>

          {/* Category and Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Category & Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_care">Home Care</SelectItem>
                    <SelectItem value="nanny">Nanny Service</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorTheme">Color Theme</Label>
                <Select
                  value={formData.colorTheme}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, colorTheme: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teal">Teal</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="indigo">Indigo</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sortOrder: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon (optional)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="Icon name or URL"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePriceDaily">Daily Price (GHS)</Label>
                <Input
                  id="basePriceDaily"
                  type="number"
                  step="0.01"
                  value={formData.basePriceDaily}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      basePriceDaily: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePriceHourly">Hourly Price (GHS)</Label>
                <Input
                  id="basePriceHourly"
                  type="number"
                  step="0.01"
                  value={formData.basePriceHourly}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      basePriceHourly: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePriceMonthly">Monthly Price (GHS)</Label>
                <Input
                  id="basePriceMonthly"
                  type="number"
                  step="0.01"
                  value={formData.basePriceMonthly}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      basePriceMonthly: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceDisplay">Custom Price Display</Label>
              <Input
                id="priceDisplay"
                value={formData.priceDisplay}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priceDisplay: e.target.value,
                  }))
                }
                placeholder="e.g., Starting from GHS 200/day"
              />
              <p className="text-sm text-gray-500">
                If provided, this will override the automatic pricing display
              </p>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Service</Label>
                <p className="text-sm text-gray-500">
                  Active services are visible to customers
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPopular">Popular Service</Label>
                <p className="text-sm text-gray-500">
                  Popular services are highlighted and featured
                </p>
              </div>
              <Switch
                id="isPopular"
                checked={formData.isPopular}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPopular: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Service" : "Update Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
