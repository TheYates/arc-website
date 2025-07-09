"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, hasPermission } from "@/lib/auth";
import AuthHeader from "@/components/auth-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AuditLogger } from "@/lib/audit-log";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Settings,
  DollarSign,
  Star,
  Eye,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  ServicePackage,
  Service,
  PackageService,
  CreatePackageRequest,
  CreateServiceRequest,
} from "@/lib/types/packages";

export default function PackageManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(
    null
  );
  const [isCreatePackageOpen, setIsCreatePackageOpen] = useState(false);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [packageForm, setPackageForm] = useState<CreatePackageRequest>({
    name: "",
    displayName: "",
    description: "",
    category: "home_care",
    basePriceDaily: 0,
    basePriceMonthly: 0,
    basePriceHourly: 0,
    isPopular: false,
    services: [],
  });

  const [serviceForm, setServiceForm] = useState<CreateServiceRequest>({
    name: "",
    description: "",
    category: "",
    baseCost: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user && !hasPermission(user.role, "admin")) {
      router.push("/dashboard");
    }
    if (user && hasPermission(user.role, "admin")) {
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls - replace with actual API endpoints
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data - replace with actual API calls
      const mockPackages: ServicePackage[] = [
        {
          id: "1",
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
        },
        {
          id: "2",
          name: "adamfo-pa",
          displayName: "ADAMFO PA",
          description:
            "Professional daily home visits with flexible scheduling and health monitoring.",
          category: "home_care",
          basePriceDaily: 80,
          basePriceMonthly: 2240,
          isActive: true,
          isPopular: false,
          sortOrder: 2,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "fie-ne-fie",
          displayName: "FIE NE FIE",
          description:
            "Live-in nanny service with professional childcare and educational support.",
          category: "nanny",
          basePriceDaily: 120,
          basePriceMonthly: 3360,
          isActive: true,
          isPopular: true,
          sortOrder: 1,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];

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
      ];

      setPackages(mockPackages);
      setServices(mockServices);
    } catch (err) {
      setError("Failed to load package data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    if (!user) return;

    try {
      setError("");
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Log the action
      await AuditLogger.log(
        user.id,
        user.email,
        "admin.package.create",
        "package",
        {
          packageName: packageForm.displayName,
          category: packageForm.category,
        }
      );

      setSuccess("Package created successfully");
      setIsCreatePackageOpen(false);
      setPackageForm({
        name: "",
        displayName: "",
        description: "",
        category: "home_care",
        basePriceDaily: 0,
        basePriceMonthly: 0,
        basePriceHourly: 0,
        isPopular: false,
        services: [],
      });
      loadData();
    } catch (err) {
      setError("Failed to create package");
    }
  };

  const handleCreateService = async () => {
    if (!user) return;

    try {
      setError("");
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Log the action
      await AuditLogger.log(
        user.id,
        user.email,
        "admin.service.create",
        "service",
        {
          serviceName: serviceForm.name,
          category: serviceForm.category,
        }
      );

      setSuccess("Service created successfully");
      setIsCreateServiceOpen(false);
      setServiceForm({
        name: "",
        description: "",
        category: "",
        baseCost: 0,
      });
      loadData();
    } catch (err) {
      setError("Failed to create service");
    }
  };

  const handleEditPackage = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    // Pre-fill the form with existing package data
    setPackageForm({
      name: pkg.name,
      displayName: pkg.displayName,
      description: pkg.description,
      category: pkg.category,
      basePriceDaily: pkg.basePriceDaily || 0,
      basePriceMonthly: pkg.basePriceMonthly || 0,
      basePriceHourly: pkg.basePriceHourly || 0,
      isPopular: pkg.isPopular,
      services: [],
    });
    setIsEditPackageOpen(true);
  };

  const handleUpdatePackage = async () => {
    if (!user || !selectedPackage) return;

    try {
      setError("");
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Log the action
      await AuditLogger.log(
        user.id,
        user.email,
        "admin.package.update",
        "package",
        {
          packageId: selectedPackage.id,
          packageName: packageForm.displayName,
          category: packageForm.category,
        }
      );

      setSuccess("Package updated successfully");
      setIsEditPackageOpen(false);
      setSelectedPackage(null);
      setPackageForm({
        name: "",
        displayName: "",
        description: "",
        category: "home_care",
        basePriceDaily: 0,
        basePriceMonthly: 0,
        basePriceHourly: 0,
        isPopular: false,
        services: [],
      });
      loadData();
    } catch (err) {
      setError("Failed to update package");
    }
  };

  const handleViewPackage = (pkg: ServicePackage) => {
    // Navigate to package details/configuration page
    router.push(`/admin/packages/${pkg.id}/configure`);
  };

  const handleConfigurePackage = (pkg: ServicePackage) => {
    // Navigate to package configuration page
    router.push(`/admin/packages/${pkg.id}/configure`);
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || pkg.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="flex space-x-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-48" />
              </div>
            </CardContent>
          </Card>

          {/* Package Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex space-x-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || !hasPermission(user.role, "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Package Management
              </h1>
              <p className="text-slate-600 mt-2">
                Manage service packages, pricing, and configurations
              </p>
            </div>
            <div className="flex space-x-3">
              <Dialog
                open={isCreateServiceOpen}
                onOpenChange={setIsCreateServiceOpen}
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
              <Dialog
                open={isCreatePackageOpen}
                onOpenChange={setIsCreatePackageOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Package
                  </Button>
                </DialogTrigger>
              </Dialog>
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

        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="packages">Service Packages</TabsTrigger>
            <TabsTrigger value="services">Individual Services</TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search packages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="home_care">Home Care</SelectItem>
                      <SelectItem value="nanny">Nanny Services</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Package List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <Card key={pkg.id} className="relative">
                  {pkg.isPopular && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {pkg.displayName}
                        </CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {pkg.category.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPackage(pkg)}
                          title="Edit Package"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPackage(pkg)}
                          title="View Package Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm mb-4">
                      {pkg.description}
                    </p>
                    <div className="space-y-2">
                      {pkg.basePriceDaily && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Daily:</span>
                          <span className="font-semibold">
                            GHS {pkg.basePriceDaily}
                          </span>
                        </div>
                      )}
                      {pkg.basePriceMonthly && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">
                            Monthly:
                          </span>
                          <span className="font-semibold">
                            GHS {pkg.basePriceMonthly}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfigurePackage(pkg)}
                        title="Configure Package Services"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            {/* Services List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm mb-4">
                      {service.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-slate-600">
                          Base Cost:
                        </span>
                        <span className="font-semibold ml-2">
                          GHS {service.baseCost}
                        </span>
                      </div>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Package Dialog */}
        <Dialog
          open={isCreatePackageOpen}
          onOpenChange={setIsCreatePackageOpen}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Package Name (ID)</Label>
                  <Input
                    id="name"
                    value={packageForm.name}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, name: e.target.value })
                    }
                    placeholder="e.g., ahenefie"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={packageForm.displayName}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        displayName: e.target.value,
                      })
                    }
                    placeholder="e.g., AHENEFIE"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={packageForm.description}
                  onChange={(e) =>
                    setPackageForm({
                      ...packageForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the package..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={packageForm.category}
                  onValueChange={(value: any) =>
                    setPackageForm({ ...packageForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_care">Home Care</SelectItem>
                    <SelectItem value="nanny">Nanny Services</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="basePriceDaily">Daily Price (GHS)</Label>
                  <Input
                    id="basePriceDaily"
                    type="number"
                    value={packageForm.basePriceDaily || ""}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        basePriceDaily: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="basePriceMonthly">Monthly Price (GHS)</Label>
                  <Input
                    id="basePriceMonthly"
                    type="number"
                    value={packageForm.basePriceMonthly || ""}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        basePriceMonthly: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="basePriceHourly">Hourly Price (GHS)</Label>
                  <Input
                    id="basePriceHourly"
                    type="number"
                    value={packageForm.basePriceHourly || ""}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        basePriceHourly: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPopular"
                  checked={packageForm.isPopular}
                  onCheckedChange={(checked) =>
                    setPackageForm({ ...packageForm, isPopular: checked })
                  }
                />
                <Label htmlFor="isPopular">Mark as Popular Package</Label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatePackageOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePackage}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Package
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Service Dialog */}
        <Dialog
          open={isCreateServiceOpen}
          onOpenChange={setIsCreateServiceOpen}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, name: e.target.value })
                  }
                  placeholder="e.g., Medication management"
                />
              </div>

              <div>
                <Label htmlFor="serviceDescription">Description</Label>
                <Textarea
                  id="serviceDescription"
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the service..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="serviceCategory">Category</Label>
                <Input
                  id="serviceCategory"
                  value={serviceForm.category}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, category: e.target.value })
                  }
                  placeholder="e.g., nursing, emergency, childcare"
                />
              </div>

              <div>
                <Label htmlFor="baseCost">Base Cost (GHS)</Label>
                <Input
                  id="baseCost"
                  type="number"
                  value={serviceForm.baseCost || ""}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      baseCost: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateServiceOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateService}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Package Dialog */}
        <Dialog open={isEditPackageOpen} onOpenChange={setIsEditPackageOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName">Package Name (ID)</Label>
                  <Input
                    id="editName"
                    value={packageForm.name}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, name: e.target.value })
                    }
                    placeholder="e.g., ahenefie"
                  />
                </div>
                <div>
                  <Label htmlFor="editDisplayName">Display Name</Label>
                  <Input
                    id="editDisplayName"
                    value={packageForm.displayName}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        displayName: e.target.value,
                      })
                    }
                    placeholder="e.g., AHENEFIE"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={packageForm.description}
                  onChange={(e) =>
                    setPackageForm({
                      ...packageForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the package..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select
                  value={packageForm.category}
                  onValueChange={(value: any) =>
                    setPackageForm({ ...packageForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_care">Home Care</SelectItem>
                    <SelectItem value="nanny">Nanny Services</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editBasePriceDaily">Daily Price (GHS)</Label>
                  <Input
                    id="editBasePriceDaily"
                    type="number"
                    value={packageForm.basePriceDaily || ""}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        basePriceDaily: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="editBasePriceMonthly">
                    Monthly Price (GHS)
                  </Label>
                  <Input
                    id="editBasePriceMonthly"
                    type="number"
                    value={packageForm.basePriceMonthly || ""}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        basePriceMonthly: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="editBasePriceHourly">
                    Hourly Price (GHS)
                  </Label>
                  <Input
                    id="editBasePriceHourly"
                    type="number"
                    value={packageForm.basePriceHourly || ""}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        basePriceHourly: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="editIsPopular"
                  checked={packageForm.isPopular}
                  onCheckedChange={(checked) =>
                    setPackageForm({ ...packageForm, isPopular: checked })
                  }
                />
                <Label htmlFor="editIsPopular">Mark as Popular Package</Label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditPackageOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePackage}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Package
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
