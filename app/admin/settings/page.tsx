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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import {
  Settings,
  Save,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  Users,
  Bell,
  Shield,
  Plus,
  Edit,
  Trash2,
  XCircle,
  List,
} from "lucide-react";

interface AdminSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  isEditable: boolean;
}

interface SettingsByCategory {
  [category: string]: AdminSetting[];
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsByCategory>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    [key: string]: string;
  }>({});

  // Service Types state
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isServiceTypesLoading, setIsServiceTypesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingServiceType, setEditingServiceType] =
    useState<ServiceType | null>(null);
  const [serviceTypeForm, setServiceTypeForm] = useState({
    name: "",
    description: "",
    category: "",
    isActive: true,
  });

  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        router.push("/");
        return;
      }
      fetchSettings();
    }
  }, [user, authLoading, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin-settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();

      // Group settings by category
      const grouped = data.settings.reduce(
        (acc: SettingsByCategory, setting: AdminSetting) => {
          if (!acc[setting.category]) {
            acc[setting.category] = [];
          }
          acc[setting.category].push(setting);
          return acc;
        },
        {}
      );

      setSettings(grouped);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      const settingsToUpdate = Object.entries(pendingChanges).map(
        ([key, value]) => ({
          key,
          value,
        })
      );

      const response = await fetch("/api/admin-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: settingsToUpdate }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      // Update local state
      setSettings((prev) => {
        const updated = { ...prev };
        Object.entries(pendingChanges).forEach(([key, value]) => {
          Object.keys(updated).forEach((category) => {
            const settingIndex = updated[category].findIndex(
              (s) => s.key === key
            );
            if (settingIndex !== -1) {
              updated[category][settingIndex].value = value;
            }
          });
        });
        return updated;
      });

      setPendingChanges({});
      setHasChanges(false);

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSettingInput = (setting: AdminSetting) => {
    const currentValue = pendingChanges[setting.key] ?? setting.value;

    if (!setting.isEditable) {
      return (
        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
          {setting.value} (Read-only)
        </div>
      );
    }

    // Boolean settings
    if (setting.value === "true" || setting.value === "false") {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={currentValue === "true"}
            onCheckedChange={(checked) =>
              handleSettingChange(setting.key, checked ? "true" : "false")
            }
          />
          <Label className="text-sm">
            {currentValue === "true" ? "Enabled" : "Disabled"}
          </Label>
        </div>
      );
    }

    // Numeric settings
    if (!isNaN(Number(setting.value))) {
      return (
        <Input
          type="number"
          value={currentValue}
          onChange={(e) => handleSettingChange(setting.key, e.target.value)}
          min="0"
        />
      );
    }

    // Text settings
    if (setting.description && setting.description.length > 100) {
      return (
        <Textarea
          value={currentValue}
          onChange={(e) => handleSettingChange(setting.key, e.target.value)}
          rows={3}
        />
      );
    }

    return (
      <Input
        value={currentValue}
        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
      />
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "service_requests":
        return <Clock className="h-5 w-5" />;
      case "scheduling":
        return <Settings className="h-5 w-5" />;
      case "notifications":
        return <Bell className="h-5 w-5" />;
      case "permissions":
        return <Shield className="h-5 w-5" />;
      case "users":
        return <Users className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Service Types Functions
  const fetchServiceTypes = async () => {
    setIsServiceTypesLoading(true);
    try {
      const response = await fetch("/api/service-types");
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
      setIsServiceTypesLoading(false);
    }
  };

  const resetServiceTypeForm = () => {
    setServiceTypeForm({
      name: "",
      description: "",
      category: "",
      isActive: true,
    });
  };

  const handleCreateServiceType = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !serviceTypeForm.name.trim() ||
      !serviceTypeForm.description.trim() ||
      !serviceTypeForm.category
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/service-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceTypeForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create service type");
      }

      toast({
        title: "Success",
        description: "Service type created successfully",
      });

      resetServiceTypeForm();
      setIsCreateDialogOpen(false);
      fetchServiceTypes();
    } catch (error: any) {
      console.error("Error creating service type:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service type",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditServiceType = (serviceType: ServiceType) => {
    setEditingServiceType(serviceType);
    setServiceTypeForm({
      name: serviceType.name,
      description: serviceType.description,
      category: serviceType.category,
      isActive: serviceType.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateServiceType = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingServiceType) return;

    if (
      !serviceTypeForm.name.trim() ||
      !serviceTypeForm.description.trim() ||
      !serviceTypeForm.category
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/service-types/${editingServiceType.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceTypeForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update service type");
      }

      toast({
        title: "Success",
        description: "Service type updated successfully",
      });

      resetServiceTypeForm();
      setIsEditDialogOpen(false);
      setEditingServiceType(null);
      fetchServiceTypes();
    } catch (error: any) {
      console.error("Error updating service type:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update service type",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteServiceType = async (serviceType: ServiceType) => {
    try {
      const response = await fetch(`/api/service-types/${serviceType.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete service type");
      }

      toast({
        title: "Success",
        description: "Service type deleted successfully",
      });

      fetchServiceTypes();
    } catch (error: any) {
      console.error("Error deleting service type:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete service type",
        variant: "destructive",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground">
            Access denied. Administrator role required.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure service request and scheduling system behavior
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      {/* Settings Tabs */}
      <Tabs
        defaultValue={Object.keys(settings)[0] || "service_types"}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          {Object.keys(settings).map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="flex items-center gap-2"
            >
              {getCategoryIcon(category)}
              <span className="hidden sm:inline">
                {getCategoryTitle(category)}
              </span>
            </TabsTrigger>
          ))}
          <TabsTrigger
            value="service_types"
            className="flex items-center gap-2"
            onClick={() => {
              if (serviceTypes.length === 0) {
                fetchServiceTypes();
              }
            }}
          >
            <List className="h-5 w-5" />
            <span className="hidden sm:inline">Service Types</span>
          </TabsTrigger>
        </TabsList>

        {Object.entries(settings).map(([category, categorySettings]) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-6">
              {categorySettings.map((setting) => (
                <Card key={setting.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {getCategoryTitle(
                            setting.key.replace(`${category}_`, "")
                          )}
                        </CardTitle>
                        {setting.description && (
                          <CardDescription className="mt-1">
                            {setting.description}
                          </CardDescription>
                        )}
                      </div>
                      {pendingChanges[setting.key] && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>{renderSettingInput(setting)}</CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}

        {/* Service Types Tab */}
        <TabsContent value="service_types">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Service Types</h3>
                <p className="text-sm text-muted-foreground">
                  Manage service types for patient requests
                </p>
              </div>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Service Type</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleCreateServiceType}
                    className="space-y-3"
                  >
                    <div>
                      <Label htmlFor="name" className="text-sm">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        value={serviceTypeForm.name}
                        onChange={(e) =>
                          setServiceTypeForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., Wound Dressing"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-sm">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={serviceTypeForm.description}
                        onChange={(e) =>
                          setServiceTypeForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Brief description"
                        rows={2}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm">
                        Category *
                      </Label>
                      <Select
                        value={serviceTypeForm.category}
                        onValueChange={(value) =>
                          setServiceTypeForm((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical_care">
                            Medical Care
                          </SelectItem>
                          <SelectItem value="medication">Medication</SelectItem>
                          <SelectItem value="monitoring">Monitoring</SelectItem>
                          <SelectItem value="therapy">Therapy</SelectItem>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="personal_care">
                            Personal Care
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        size="sm"
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Create"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Service Types List */}
            {isServiceTypesLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : serviceTypes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-medium mb-2">No Service Types</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create your first service type to get started
                  </p>
                  <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Service Type
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceTypes.map((serviceType) => (
                      <TableRow key={serviceType.id}>
                        <TableCell className="font-medium">
                          {serviceType.name}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate text-sm text-muted-foreground">
                            {serviceType.description}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {serviceType.category.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              serviceType.isActive ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {serviceType.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {serviceType.usageCount}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditServiceType(serviceType)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Service Type
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {serviceType.name}"? This action cannot be
                                    undone.
                                    {serviceType.usageCount > 0 && (
                                      <span className="block mt-2 text-orange-600">
                                        Warning: This service type has been used{" "}
                                        {serviceType.usageCount} times.
                                      </span>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteServiceType(serviceType)
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  You have unsaved changes
                </p>
                <p className="text-sm text-orange-700">
                  Don't forget to save your changes before leaving this page.
                </p>
              </div>
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Service Type Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service Type</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateServiceType} className="space-y-3">
            <div>
              <Label htmlFor="edit-name" className="text-sm">
                Name *
              </Label>
              <Input
                id="edit-name"
                value={serviceTypeForm.name}
                onChange={(e) =>
                  setServiceTypeForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g., Wound Dressing"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-sm">
                Description *
              </Label>
              <Textarea
                id="edit-description"
                value={serviceTypeForm.description}
                onChange={(e) =>
                  setServiceTypeForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description"
                rows={2}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-category" className="text-sm">
                Category *
              </Label>
              <Select
                value={serviceTypeForm.category}
                onValueChange={(value) =>
                  setServiceTypeForm((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical_care">Medical Care</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="therapy">Therapy</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="personal_care">Personal Care</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={serviceTypeForm.isActive}
                onChange={(e) =>
                  setServiceTypeForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingServiceType(null);
                  resetServiceTypeForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
