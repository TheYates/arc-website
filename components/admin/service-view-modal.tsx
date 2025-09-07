"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Separator removed - not used in simplified version
import { Service } from "@prisma/client";
import {
  Edit,
  Package,
  DollarSign,
  Calendar,
  Tag,
  BarChart3,
  Loader2,
} from "lucide-react";

interface ServiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  serviceId: string | null;
}

// ServiceItemRenderer removed - not used in simplified version

export default function ServiceViewModal({
  isOpen,
  onClose,
  onEdit,
  serviceId,
}: ServiceViewModalProps) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (serviceId && isOpen) {
      fetchServiceDetails();
    }
  }, [serviceId, isOpen]);

  const fetchServiceDetails = async () => {
    if (!serviceId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setService(data.service);
      } else {
        console.error("Failed to fetch service details");
      }
    } catch (error) {
      console.error("Error fetching service details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "home_care":
        return "bg-teal-100 text-teal-800";
      case "nanny":
        return "bg-purple-100 text-purple-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "home_care":
        return "Home Care";
      case "nanny":
        return "Nanny Service";
      case "emergency":
        return "Emergency";
      default:
        return "Custom";
    }
  };

  const formatPrice = (_service: Service) => {
    // TODO: Add pricing fields to Prisma Service model
    // For now, return a default message
    return "Contact for pricing";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading service details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!service) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <p>Service not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {service.displayName}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {service.shortDescription}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getCategoryBadgeColor(service.category)}>
                {getCategoryLabel(service.category)}
              </Badge>
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive ? "Active" : "Inactive"}
              </Badge>
              {service.isPopular && <Badge variant="outline">Popular</Badge>}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">
                    Service Name
                  </h4>
                  <p>{service.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">
                    URL Slug
                  </h4>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    /services/{service.slug}
                  </p>
                </div>
              </div>

              {service.description && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">
                    Description
                  </h4>
                  <p className="text-gray-700">{service.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">
                    Display Price
                  </h4>
                  <p className="text-lg font-semibold text-teal-600">
                    {formatPrice(service)}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500">
                    Pricing
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>Contact for pricing details</p>
                    {/* TODO: Add pricing fields to Prisma Service model */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Service Items
              </CardTitle>
              <CardDescription>
                Components included in this service
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {/* TODO: Display service items from Prisma ServiceItem model */}
                <p className="text-gray-500 text-sm">
                  Service items will be displayed here when the ServiceItem relationship is properly configured.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuration & Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">
                    Sort Order
                  </h4>
                  <p>{service.sortOrder}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">
                    Color Theme
                  </h4>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full bg-${service.colorTheme}-500`}
                    />
                    <span className="capitalize">{service.colorTheme}</span>
                  </div>
                </div>
                {service.icon && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">
                      Icon
                    </h4>
                    <p className="font-mono text-sm">{service.icon}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">
                    Created
                  </h4>
                  <p>{formatDate(service.createdAt.toISOString())}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">
                    Last Updated
                  </h4>
                  <p>{formatDate(service.updatedAt.toISOString())}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
