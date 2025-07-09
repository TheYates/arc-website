"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, hasPermission } from "@/lib/auth";
import AuthHeader from "@/components/auth-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AuditLogger } from "@/lib/audit-log";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Settings,
  Package,
  Star,
  X,
} from "lucide-react";
import { ServicePackage, Service, PackageService } from "@/lib/types/packages";

export default function PackageConfigurationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [package_, setPackage] = useState<ServicePackage | null>(null);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [packageServices, setPackageServices] = useState<PackageService[]>([]);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && !hasPermission(user.role, "admin")) {
      router.push("/dashboard");
    }
    if (user && hasPermission(user.role, "admin") && packageId) {
      loadPackageData();
    }
  }, [user, authLoading, router, packageId]);

  const loadPackageData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls - replace with actual API endpoints
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock package data
      const mockPackage: ServicePackage = {
        id: packageId,
        name: "ahenefie",
        displayName: "AHENEFIE",
        description:
          "24/7 live-in home care with dedicated nursing support and emergency response.",
        category: "home_care",
        basePriceDaily: 150,
        basePriceMonthly: 4200,
        isActive: true,
        isPopular: true,
        sortOrder: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      // Mock available services
      const mockServices: Service[] = [
        {
          id: "1",
          name: "24/7 live-in nursing care",
          description: "Round-the-clock professional nursing care",
          category: "nursing",
          baseCost: 0,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Emergency response & ambulance",
          description: "Emergency medical response and ambulance services",
          category: "emergency",
          baseCost: 50,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Medication management",
          description: "Professional medication administration and monitoring",
          category: "nursing",
          baseCost: 25,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "4",
          name: "Wound care management",
          description: "Professional wound care and dressing changes",
          category: "nursing",
          baseCost: 30,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "5",
          name: "Vital signs monitoring",
          description: "Regular monitoring of vital signs",
          category: "nursing",
          baseCost: 15,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];

      // Mock package services (current configuration)
      const mockPackageServices: PackageService[] = [
        {
          id: "ps1",
          packageId: packageId,
          serviceId: "1",
          inclusionType: "standard",
          additionalPriceDaily: 0,
          additionalPriceMonthly: 0,
          additionalPriceHourly: 0,
          isActive: true,
          sortOrder: 1,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "ps2",
          packageId: packageId,
          serviceId: "2",
          inclusionType: "standard",
          additionalPriceDaily: 0,
          additionalPriceMonthly: 0,
          additionalPriceHourly: 0,
          isActive: true,
          sortOrder: 2,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "ps3",
          packageId: packageId,
          serviceId: "3",
          inclusionType: "optional",
          additionalPriceDaily: 25,
          additionalPriceMonthly: 700,
          additionalPriceHourly: 5,
          isActive: true,
          sortOrder: 3,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "ps4",
          packageId: packageId,
          serviceId: "4",
          inclusionType: "optional",
          additionalPriceDaily: 30,
          additionalPriceMonthly: 840,
          additionalPriceHourly: 6,
          isActive: true,
          sortOrder: 4,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];

      setPackage(mockPackage);
      setAvailableServices(mockServices);
      setPackageServices(mockPackageServices);
    } catch (err) {
      setError("Failed to load package configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateServiceConfiguration = async (
    packageServiceId: string,
    updates: Partial<PackageService>
  ) => {
    if (!user) return;

    try {
      setError("");

      // Update local state
      setPackageServices((prev) =>
        prev.map((ps) =>
          ps.id === packageServiceId ? { ...ps, ...updates } : ps
        )
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Log the action
      await AuditLogger.log(
        user.id,
        user.email,
        "admin.package.service.update",
        "package_service",
        {
          packageId,
          packageServiceId,
          updates,
        }
      );

      setSuccess("Service configuration updated");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update service configuration");
    }
  };

  const handleAddService = async () => {
    if (!user || !selectedServiceId) return;

    try {
      setError("");

      const newPackageService: PackageService = {
        id: `ps_${Date.now()}`,
        packageId,
        serviceId: selectedServiceId,
        inclusionType: "optional",
        additionalPriceDaily: 0,
        additionalPriceMonthly: 0,
        additionalPriceHourly: 0,
        isActive: true,
        sortOrder: packageServices.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPackageServices((prev) => [...prev, newPackageService]);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Log the action
      await AuditLogger.log(
        user.id,
        user.email,
        "admin.package.service.add",
        "package_service",
        {
          packageId,
          serviceId: selectedServiceId,
        }
      );

      setSuccess("Service added to package");
      setIsAddServiceOpen(false);
      setSelectedServiceId("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to add service to package");
    }
  };

  const handleRemoveService = async (packageServiceId: string) => {
    if (!user) return;

    try {
      setError("");

      setPackageServices((prev) =>
        prev.filter((ps) => ps.id !== packageServiceId)
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Log the action
      await AuditLogger.log(
        user.id,
        user.email,
        "admin.package.service.remove",
        "package_service",
        {
          packageId,
          packageServiceId,
        }
      );

      setSuccess("Service removed from package");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to remove service from package");
    }
  };

  const handleSaveConfiguration = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      setError("");

      // Simulate API call to save all configurations
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Log the action
      await AuditLogger.log(
        user.id,
        user.email,
        "admin.package.configuration.save",
        "package",
        {
          packageId,
          servicesCount: packageServices.length,
        }
      );

      setSuccess("Package configuration saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save package configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const getServiceById = (serviceId: string) => {
    return availableServices.find((s) => s.id === serviceId);
  };

  const getAvailableServicesToAdd = () => {
    const usedServiceIds = packageServices.map((ps) => ps.serviceId);
    return availableServices.filter((s) => !usedServiceIds.includes(s.id));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8" />
                  <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <div className="flex space-x-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </div>

          {/* Package Overview Skeleton */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <div>
                      <Skeleton className="h-6 w-20 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Service Configuration Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">
                        <Skeleton className="h-4 w-16" />
                      </th>
                      <th className="text-left py-3 px-2">
                        <Skeleton className="h-4 w-12" />
                      </th>
                      <th className="text-left py-3 px-2">
                        <Skeleton className="h-4 w-20" />
                      </th>
                      <th className="text-left py-3 px-2">
                        <Skeleton className="h-4 w-24" />
                      </th>
                      <th className="text-center py-3 px-2">
                        <Skeleton className="h-4 w-16" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 px-2">
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Skeleton className="h-8 w-24" />
                        </td>
                        <td className="py-3 px-2">
                          <Skeleton className="h-8 w-16" />
                        </td>
                        <td className="py-3 px-2">
                          <Skeleton className="h-8 w-16" />
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Skeleton className="h-8 w-8 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || !hasPermission(user.role, "admin") || !package_) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/packages")}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-teal-600" />
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {package_.displayName}
                  </h1>
                  <p className="text-slate-600">
                    Configure services and pricing
                  </p>
                </div>
                {package_.isPopular && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <Dialog
                open={isAddServiceOpen}
                onOpenChange={setIsAddServiceOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button
                onClick={handleSaveConfiguration}
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{success}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccess("")}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError("")}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Package Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    GHS {package_.basePriceDaily}
                  </p>
                  <p className="text-sm text-slate-600">Base Daily Price</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    GHS {package_.basePriceMonthly}
                  </p>
                  <p className="text-sm text-slate-600">Base Monthly Price</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Settings className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {packageServices.length}
                  </p>
                  <p className="text-sm text-slate-600">Configured Services</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Service Configuration</CardTitle>
            <p className="text-slate-600">
              Configure which services are included as standard or available as
              optional add-ons
            </p>
          </CardHeader>
          <CardContent>
            {packageServices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-slate-900">
                        Service
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-slate-900">
                        Type
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-slate-900">
                        Daily Price
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-slate-900">
                        Monthly Price
                      </th>
                      <th className="text-center py-3 px-2 font-medium text-slate-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {packageServices.map((packageService) => {
                      const service = getServiceById(packageService.serviceId);
                      if (!service) return null;

                      return (
                        <tr
                          key={packageService.id}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="py-3 px-2">
                            <div>
                              <div className="font-medium text-slate-900">
                                {service.name}
                              </div>
                              <div className="text-sm text-slate-600">
                                {service.description}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Select
                              value={packageService.inclusionType}
                              onValueChange={(value: "standard" | "optional") =>
                                handleUpdateServiceConfiguration(
                                  packageService.id,
                                  { inclusionType: value }
                                )
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">
                                  Standard
                                </SelectItem>
                                <SelectItem value="optional">
                                  Optional
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-2">
                            {packageService.inclusionType === "optional" ? (
                              <Input
                                type="number"
                                value={packageService.additionalPriceDaily}
                                onChange={(e) =>
                                  handleUpdateServiceConfiguration(
                                    packageService.id,
                                    {
                                      additionalPriceDaily: Number(
                                        e.target.value
                                      ),
                                    }
                                  )
                                }
                                className="w-20"
                                placeholder="0"
                              />
                            ) : (
                              <span className="text-slate-500 text-sm">
                                Included
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {packageService.inclusionType === "optional" ? (
                              <Input
                                type="number"
                                value={packageService.additionalPriceMonthly}
                                onChange={(e) =>
                                  handleUpdateServiceConfiguration(
                                    packageService.id,
                                    {
                                      additionalPriceMonthly: Number(
                                        e.target.value
                                      ),
                                    }
                                  )
                                }
                                className="w-20"
                                placeholder="0"
                              />
                            ) : (
                              <span className="text-slate-500 text-sm">
                                Included
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveService(packageService.id)
                              }
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="Remove Service"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No services configured for this package</p>
                <p className="text-sm">Add services to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Service Dialog */}
        <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Service to Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceSelect">Select Service</Label>
                <Select
                  value={selectedServiceId}
                  onValueChange={setSelectedServiceId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a service to add..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableServicesToAdd().map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-slate-500">
                            {service.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {getAvailableServicesToAdd().length === 0 && (
                <div className="text-center py-4 text-slate-500">
                  <p>All available services have been added to this package</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddServiceOpen(false);
                    setSelectedServiceId("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddService}
                  disabled={!selectedServiceId}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
