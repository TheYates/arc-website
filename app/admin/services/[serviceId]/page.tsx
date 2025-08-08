"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Settings,
  Package,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { ServiceHierarchyManager } from "@/components/admin/service-hierarchy-manager";
import { AdminServiceDetailMobile } from "@/components/mobile/admin-service-detail";

interface Service {
  id: string;
  name: string;
  displayName: string;
  description: string;
  shortDescription: string;
  category: string;
  basePriceDaily: number;
  basePriceMonthly: number;
  basePriceHourly: number;
  priceDisplay: string;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  colorTheme: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  categories?: ServiceCategory[];
  pricing?: ServicePricing[];
}

interface ServiceCategory {
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  items?: ServiceItem[];
}

interface ServiceItem {
  id: string;
  categoryId: string;
  parentItemId?: string;
  name: string;
  description?: string;
  isOptional: boolean;
  itemLevel: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ServicePricing {
  id: string;
  serviceId: string;
  tierName: string;
  price: number;
  billingPeriod: "hourly" | "daily" | "weekly" | "monthly" | "yearly";
  description?: string;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function ServiceManagementPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setService(data.service);
        // Set first category as default for hierarchy editor
        if (data.service.categories?.length > 0) {
          setSelectedCategory(data.service.categories[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading service:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/admin/services");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading service details...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Service not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <AdminServiceDetailMobile serviceId={serviceId} />
      </div>

      {/* Header */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{service.displayName}</h1>
            <p className="text-muted-foreground">{service.shortDescription}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={service.isActive ? "default" : "secondary"}>
            {service.isActive ? "Active" : "Inactive"}
          </Badge>
          {service.isPopular && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-600"
            >
              Popular
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="hidden md:block space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="hierarchy" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Service Items
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Service Name
                  </label>
                  <p className="text-lg font-semibold">{service.displayName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Internal Name
                  </label>
                  <p>{service.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <p className="capitalize">
                    {service.category.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-sm">{service.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Hourly Rate
                  </label>
                  <p className="text-lg font-semibold">
                    {formatPrice(service.basePriceHourly)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Daily Rate
                  </label>
                  <p className="text-lg font-semibold">
                    {formatPrice(service.basePriceDaily)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Monthly Rate
                  </label>
                  <p className="text-lg font-semibold">
                    {formatPrice(service.basePriceMonthly)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Display Format
                  </label>
                  <p>{service.priceDisplay}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Categories */}
          <Card>
            <CardHeader>
              <CardTitle>
                Service Categories ({service.categories?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {service.categories?.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {category.items?.length || 0} items
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Items Tab */}
        <TabsContent value="hierarchy" className="space-y-6">
          {service.categories && service.categories.length > 0 && (
            <ServiceHierarchyManager
              serviceId={serviceId}
              categories={service.categories as unknown as any}
              onSave={loadService}
            />
          )}
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              {service.pricing && service.pricing.length > 0 ? (
                <div className="space-y-4">
                  {service.pricing.map((tier) => (
                    <div key={tier.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{tier.tierName}</h4>
                          {tier.description && (
                            <p className="text-sm text-muted-foreground">
                              {tier.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {formatPrice(tier.price)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            per {tier.billingPeriod}
                          </p>
                          {tier.isDefault && (
                            <Badge variant="default" className="mt-1">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No pricing tiers configured
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">
                    Active Bookings
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">
                    Customer Reviews
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-muted-foreground">
                  Analytics features coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card className="hidden md:block">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>Created: {formatDate(service.createdAt)}</div>
            <div>Last Updated: {formatDate(service.updatedAt)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
