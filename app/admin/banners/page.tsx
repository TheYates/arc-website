"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLogos } from "@/hooks/use-logos";
import { Logo, CreateLogoRequest, UpdateLogoRequest } from "@/lib/types/logos";
import { TabletLogosManagement } from "@/components/admin/tablet-logos-management";
import { useDeviceType } from "@/hooks/use-device-type";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Megaphone,
} from "lucide-react";
import Image from "next/image";

export default function BannersManagementPage() {
  const { logos, isLoading, createLogo, updateLogo, deleteLogo, reorderLogos } =
    useLogos();
  const { toast } = useToast();
  const { isTablet } = useDeviceType();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<Logo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateLogoRequest>({
    name: "",
    alt: "",
    width: 120,
    height: 60,
    isActive: true,
    sortOrder: logos.length + 1,
  });

  const [editForm, setEditForm] = useState<UpdateLogoRequest>({
    id: "",
    name: "",
    alt: "",
    width: 120,
    height: 60,
    isActive: true,
    sortOrder: 1,
  });

  const handleCreateLogo = async () => {
    if (!createForm.name || !createForm.alt) {
      toast({
        title: "Error",
        description: "Name and alt text are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createLogo(createForm);
      if (result.success) {
        toast({
          title: "Success",
          description: "Advert created successfully",
        });
        setIsCreateDialogOpen(false);
        setCreateForm({
          name: "",
          alt: "",
          width: 120,
          height: 60,
          isActive: true,
          sortOrder: logos.length + 1,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create advert",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLogo = async () => {
    if (!editForm.name || !editForm.alt) {
      toast({
        title: "Error",
        description: "Name and alt text are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateLogo(editForm);
      if (result.success) {
        toast({
          title: "Success",
          description: "Advert updated successfully",
        });
        setIsEditDialogOpen(false);
        setSelectedLogo(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update advert",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!selectedLogo?.id) return;

    setIsSubmitting(true);
    try {
      const result = await deleteLogo(selectedLogo.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Advert deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setSelectedLogo(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete advert",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (logo: Logo) => {
    setSelectedLogo(logo);
    setEditForm({
      id: logo.id!,
      name: logo.name,
      alt: logo.alt,
      width: logo.width,
      height: logo.height,
      isActive: logo.isActive,
      sortOrder: logo.sortOrder,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (logo: Logo) => {
    setSelectedLogo(logo);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Scrolling Banners</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Tablet view
  if (isTablet) {
    return (
      <TabletLogosManagement
        logos={logos}
        isLoading={isLoading}
        createLogo={createLogo}
        updateLogo={updateLogo}
        deleteLogo={deleteLogo}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scrolling Banners</h1>
          <p className="text-muted-foreground">
            Manage partner banners displayed in the scrolling section
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Advert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Advert</DialogTitle>
              <DialogDescription>
                Add a new partner advert to the scrolling section.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder="Company name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-alt">Alt Text</Label>
                <Input
                  id="create-alt"
                  value={createForm.alt}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, alt: e.target.value })
                  }
                  placeholder="Advert description for accessibility"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-width">Width</Label>
                  <Input
                    id="create-width"
                    type="number"
                    value={createForm.width}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        width: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-height">Height</Label>
                  <Input
                    id="create-height"
                    type="number"
                    value={createForm.height}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        height: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-file">Advert Image</Label>
                <Input
                  id="create-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCreateForm({ ...createForm, file });
                    }
                  }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-active"
                  checked={createForm.isActive}
                  onCheckedChange={(checked) =>
                    setCreateForm({ ...createForm, isActive: checked })
                  }
                />
                <Label htmlFor="create-active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleCreateLogo}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Advert"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Banners
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logos.filter((logo) => logo.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Banners
            </CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logos.filter((logo) => !logo.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logos.map((logo) => (
          <Card key={logo.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{logo.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={logo.isActive ? "default" : "secondary"}>
                    {logo.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center h-20 bg-gray-50 rounded border">
                {logo.src ? (
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width || 120}
                    height={logo.height || 60}
                    className="max-h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No image</div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{logo.alt}</p>
                <p className="text-xs text-muted-foreground">
                  Size: {logo.width}x{logo.height} | Order: {logo.sortOrder}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(logo)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteDialog(logo)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Advert</DialogTitle>
            <DialogDescription>
              Update the advert information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Company name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-alt">Alt Text</Label>
              <Input
                id="edit-alt"
                value={editForm.alt}
                onChange={(e) =>
                  setEditForm({ ...editForm, alt: e.target.value })
                }
                placeholder="Advert description for accessibility"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-width">Width</Label>
                <Input
                  id="edit-width"
                  type="number"
                  value={editForm.width}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      width: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-height">Height</Label>
                <Input
                  id="edit-height"
                  type="number"
                  value={editForm.height}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      height: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-file">Replace Advert Image (optional)</Label>
              <Input
                id="edit-file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEditForm({ ...editForm, file });
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={editForm.isActive}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, isActive: checked })
                }
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleEditLogo}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Advert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              advert "{selectedLogo?.name}" from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLogo}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
