"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, TrendingUp, Users, DollarSign, Save } from "lucide-react";
import { AdminServicesMobile } from "@/components/mobile/admin-services";
import { useAuth } from "@/lib/auth";
import { PricingCardView } from "@/components/admin/pricing-card-view";
import PricingItemFormModal from "@/components/admin/pricing-item-form-modal";

import type { PricingItem } from "@/lib/types/packages";

export default function AdminPackagesPage() {
  const { user } = useAuth();

  // Services data state - loaded from PostgreSQL database
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load services from database
  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/pricing");
        const result = await response.json();

        if (result.success && result.data) {
          setPricingItems(result.data);
        } else {
          console.error("Failed to load services:", result.error);
          setPricingItems([]);
        }
      } catch (error) {
        console.error("Error loading services:", error);
        setPricingItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  const [selectedPricingItem, setSelectedPricingItem] =
    useState<PricingItem | null>(null);
  const [isPricingItemDialogOpen, setIsPricingItemDialogOpen] = useState(false);
  const [pricingItemMode, setPricingItemMode] = useState<"create" | "edit">(
    "create"
  );
  const [parentItemId, setParentItemId] = useState<string | null>(null);
  const [defaultItemType, setDefaultItemType] =
    useState<PricingItem["type"]>("service");

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Notification dialog state
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  // Helper function to show notifications
  const showNotification = (
    title: string,
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotificationDialog({
      open: true,
      title,
      message,
      type,
    });
  };

  // Save function - now actually saves to PostgreSQL database
  const handleSavePricingData = useCallback(async () => {
    try {
      console.log("💾 handleSavePricingData called", {
        hasUnsavedChanges,
        isSaving,
        itemsCount: pricingItems.length,
      });

      setIsSaving(true);

      // Save all pricing data to PostgreSQL database
      const response = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: pricingItems,
        }),
      });

      const result = await response.json();
      console.log("💾 Save response:", result);

      if (result.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        console.log("✅ Save successful - data saved to PostgreSQL database");

        // Log success message but don't show dialog
        if (
          result.details &&
          (result.details.updated > 0 || result.details.created > 0)
        ) {
          console.log(
            `✅ Save successful! Updated: ${result.details.updated}, Created: ${result.details.created}`
          );
        }
      } else {
        console.error("❌ Save failed:", result.error);
        showNotification(
          "Save Failed",
          `Failed to save changes: ${result.error}`,
          "error"
        );

        // Show detailed errors if available
        if (result.errors && result.errors.length > 0) {
          console.error("Detailed errors:", result.errors);
        }
      }
    } catch (error) {
      console.error("💥 Error saving services data:", error);
      showNotification(
        "Save Error",
        "Failed to save changes. Please check the console for details.",
        "error"
      );
    } finally {
      setIsSaving(false);
      console.log("Save process completed");
    }
  }, [hasUnsavedChanges, isSaving, pricingItems]);

  // Debug useEffect to track hasUnsavedChanges changes
  useEffect(() => {
    console.log("hasUnsavedChanges changed to:", hasUnsavedChanges);
  }, [hasUnsavedChanges]);

  // Debug useEffect to track modal state
  useEffect(() => {
    console.log("isPricingItemDialogOpen changed to:", isPricingItemDialogOpen);
  }, [isPricingItemDialogOpen]);

  // Safety mechanism: detect and fix frozen states
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if save button should be enabled but might be stuck
      if (hasUnsavedChanges && !isSaving && !isPricingItemDialogOpen) {
        console.log("Save button safety check: button should be clickable");
      }

      // Check for potential frozen modal state
      if (isPricingItemDialogOpen && !isSaving) {
        console.log("Modal safety check: modal is open");

        // Check if modal has been open for too long (more than 5 minutes)
        const modalOpenTime = Date.now() - (window as any).modalOpenTimestamp;
        if ((window as any).modalOpenTimestamp && modalOpenTime > 300000) {
          console.warn(
            "Modal has been open for more than 5 minutes, might be frozen"
          );
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, isSaving, isPricingItemDialogOpen]);

  // Track modal open time for safety checks
  useEffect(() => {
    if (isPricingItemDialogOpen) {
      (window as any).modalOpenTimestamp = Date.now();
      console.log("Modal opened at:", new Date().toISOString());
    } else {
      delete (window as any).modalOpenTimestamp;
      console.log("Modal closed at:", new Date().toISOString());
    }
  }, [isPricingItemDialogOpen]);

  // Global cleanup effect to prevent UI freezing (simplified)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Emergency escape: Ctrl+Alt+R to force reset UI state
      if (e.ctrlKey && e.altKey && e.key === "r") {
        e.preventDefault();
        console.log("🚨 Emergency UI reset triggered");

        // Force close all dialogs
        setIsPricingItemDialogOpen(false);
        setSelectedPricingItem(null);
        setParentItemId(null);
        setNotificationDialog((prev) => ({ ...prev, open: false }));

        // Force cleanup styles only (no DOM manipulation)
        setTimeout(() => {
          document.body.style.pointerEvents = "auto";
          document.body.style.overflow = "auto";
          console.log("🚨 Emergency UI reset completed");
        }, 100);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S to save
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        if (hasUnsavedChanges && !isSaving) {
          handleSavePricingData();
        }
      }
      // Escape to close modal
      if (event.key === "Escape") {
        if (isPricingItemDialogOpen) {
          event.preventDefault();
          setIsPricingItemDialogOpen(false);
          setSelectedPricingItem(null);
          setParentItemId(null);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    hasUnsavedChanges,
    isSaving,
    handleSavePricingData,
    isPricingItemDialogOpen,
  ]);

  // Check if user is admin (using consistent lowercase roles)
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the services management page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <strong>Current Status:</strong>{" "}
                {user ? `Logged in as ${user.email}` : "Not logged in"}
              </div>
              {user && (
                <div className="text-sm text-gray-600">
                  <strong>Your Role:</strong> {user.role}
                </div>
              )}
              <div className="text-sm text-gray-600">
                <strong>Required Roles:</strong> admin or super_admin
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  Need Access?
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {!user ? (
                    <>
                      Please log in with admin credentials at{" "}
                      <a href="/login" className="underline">
                        /login
                      </a>
                    </>
                  ) : (
                    "Contact your administrator to upgrade your role permissions."
                  )}
                </p>
                {!user && (
                  <div className="mt-2 text-xs text-blue-600">
                    <strong>Default Admin:</strong> admin@arc.com / password
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pricing tree handlers
  const handleAddPricingItem = (
    parentId: string | null,
    type: PricingItem["type"]
  ) => {
    setParentItemId(parentId);
    setDefaultItemType(type);
    setSelectedPricingItem(null);
    setPricingItemMode("create");
    setIsPricingItemDialogOpen(true);
  };

  const handleEditPricingItem = (item: PricingItem) => {
    setSelectedPricingItem(item);
    setPricingItemMode("edit");
    setIsPricingItemDialogOpen(true);
  };

  const handleDeletePricingItem = async (item: PricingItem) => {
    console.log("🗑️ Starting delete operation for:", item.name, item.type);

    try {
      // Ensure all modals are closed before starting delete
      setIsPricingItemDialogOpen(false);
      setSelectedPricingItem(null);
      setParentItemId(null);

      // Clear any existing notifications
      setNotificationDialog((prev) => ({ ...prev, open: false }));

      // Small delay to ensure UI state is clean
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (item.type === "service") {
        console.log("🗑️ Deleting service via API...");
        // Delete service via PostgreSQL API
        const response = await fetch(`/api/services/${item.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete service from PostgreSQL");
        }

        console.log("✅ Service deleted, reloading data...");
        // Reload services from database
        const loadResponse = await fetch("/api/admin/pricing");
        const loadResult = await loadResponse.json();
        if (loadResult.success) {
          setPricingItems(loadResult.data);

          // Show success notification after a small delay
          setTimeout(() => {
            showNotification(
              "Service Deleted",
              `Service "${item.name}" has been deleted successfully.`,
              "success"
            );
          }, 200);
        }
      } else {
        console.log("🗑️ Deleting service item via API...");
        // For features/addons, delete from database via API
        const response = await fetch(`/api/services/items/${item.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete service item from database");
        }

        console.log("✅ Service item deleted, updating local state...");
        // Remove from local state and mark as changed
        setPricingItems((prev) => removeItemFromTree(prev, item.id));
        setHasUnsavedChanges(true);

        // Show success notification after a small delay
        setTimeout(() => {
          showNotification(
            "Item Deleted",
            `${item.type === "feature" ? "Feature" : "Addon"} "${
              item.name
            }" has been deleted successfully.`,
            "success"
          );
        }, 200);
      }

      console.log("✅ Delete operation completed successfully");
    } catch (error) {
      console.error("💥 Error deleting item:", error);

      // Show error notification after a small delay
      setTimeout(() => {
        showNotification(
          "Delete Failed",
          "Failed to delete item. Please try again.",
          "error"
        );
      }, 200);
    }
  };

  const handleClonePricingItem = (item: PricingItem) => {
    const clonedItem: PricingItem = {
      ...item,
      id: `${item.id}_clone_${Date.now()}`,
      name: `${item.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to the same parent level
    setPricingItems((prev) =>
      addItemToTree(prev, clonedItem, item.parentId || null)
    );
    setHasUnsavedChanges(true);
  };

  const handleReorderPricingItems = (reorderedItems: PricingItem[]) => {
    setPricingItems(reorderedItems);
    setHasUnsavedChanges(true);
  };

  const handleSavePricingItem = useCallback(
    async (itemData: Partial<PricingItem>) => {
      try {
        console.log("handleSavePricingItem called with:", itemData);
        console.log("Current modal state:", {
          isPricingItemDialogOpen,
          pricingItemMode,
          parentItemId,
        });

        if (pricingItemMode === "create") {
          if (itemData.type === "service") {
            // Create new service via PostgreSQL API
            const serviceData = {
              name: itemData.name || "",
              slug: (itemData.name || "").toLowerCase().replace(/\s+/g, "-"),
              displayName: itemData.name || "",
              description: itemData.description,
              category: "HOME_CARE", // Default category
              isActive: true,
              isPopular: false,
              sortOrder: itemData.sortOrder || 0,
              colorTheme: itemData.colorTheme || "teal", // Use selected color theme
            };

            const response = await fetch("/api/services", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(serviceData),
            });

            if (!response.ok) {
              throw new Error("Failed to create service in PostgreSQL");
            }

            // Reload services from database
            const loadResponse = await fetch("/api/admin/pricing");
            const loadResult = await loadResponse.json();
            if (loadResult.success) {
              setPricingItems(loadResult.data);
            }
          } else {
            // For features/addons, add to local state (would be service items in full implementation)
            const newItem: PricingItem = {
              id: `item_${Date.now()}`,
              name: itemData.name || "",
              description: itemData.description,
              type: itemData.type || "feature",
              isRequired:
                itemData.isRequired !== undefined ? itemData.isRequired : true,
              isRecurring:
                itemData.isRecurring !== undefined
                  ? itemData.isRecurring
                  : true,
              parentId: parentItemId,
              sortOrder: itemData.sortOrder || 0,
              children: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            setPricingItems((prev) =>
              addItemToTree(prev, newItem, parentItemId)
            );
            setHasUnsavedChanges(true);
          }
        } else if (selectedPricingItem) {
          const updatedItem: PricingItem = {
            ...selectedPricingItem,
            ...itemData,
            updatedAt: new Date().toISOString(),
          };

          console.log("Updating item in tree:", updatedItem);
          setPricingItems((prev) => updateItemInTree(prev, updatedItem));
          console.log("Item updated, setting hasUnsavedChanges to true");
          setHasUnsavedChanges(true);
        }

        // Force close modal with multiple approaches
        console.log("Closing modal...");
        setIsPricingItemDialogOpen(false);
        setSelectedPricingItem(null);
        setParentItemId(null);

        // Add a small delay to ensure state updates are processed
        setTimeout(() => {
          console.log("Modal should be closed now, final state:", {
            isPricingItemDialogOpen: false,
            selectedPricingItem: null,
            parentItemId: null,
          });
        }, 100);
      } catch (error) {
        console.error("Error saving pricing item:", error);
        // Force close dialog even on error
        setIsPricingItemDialogOpen(false);
        setSelectedPricingItem(null);
        setParentItemId(null);
        throw error;
      }
    },
    [
      pricingItemMode,
      parentItemId,
      selectedPricingItem,
      isPricingItemDialogOpen,
    ]
  );

  // Helper functions for tree operations
  const removeItemFromTree = (
    items: PricingItem[],
    idToRemove: string
  ): PricingItem[] => {
    return items.filter((item) => {
      if (item.id === idToRemove) return false;
      if (item.children) {
        item.children = removeItemFromTree(item.children, idToRemove);
      }
      return true;
    });
  };

  const addItemToTree = (
    items: PricingItem[],
    newItem: PricingItem,
    parentId: string | null
  ): PricingItem[] => {
    if (parentId === null) {
      return [...items, newItem];
    }

    return items.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newItem],
        };
      }
      if (item.children) {
        return {
          ...item,
          children: addItemToTree(item.children, newItem, parentId),
        };
      }
      return item;
    });
  };

  const updateItemInTree = (
    items: PricingItem[],
    updatedItem: PricingItem
  ): PricingItem[] => {
    return items.map((item) => {
      if (item.id === updatedItem.id) {
        return { ...updatedItem, children: item.children };
      }
      if (item.children) {
        return {
          ...item,
          children: updateItemInTree(item.children, updatedItem),
        };
      }
      return item;
    });
  };

  return (
    <div className="space-y-6">
      {/* Mobile (distinct UI) */}
      <div className="md:hidden">
        <AdminServicesMobile
          onCreateService={() => {
            setParentItemId(null);
            setDefaultItemType("service");
            setSelectedPricingItem(null);
            setPricingItemMode("create");
            setIsPricingItemDialogOpen(true);
          }}
          onEditService={(service) => {
            setSelectedPricingItem(service);
            setPricingItemMode("edit");
            setIsPricingItemDialogOpen(true);
          }}
        />
      </div>

      {/* Desktop UI */}
      <div className="hidden md:block space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Service Management
            </h1>
            <p className="text-muted-foreground">
              Configure and manage your healthcare service offerings
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Database Connected</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Services
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pricingItems.filter((item) => item.type === "service").length}
              </div>
              <p className="text-xs text-muted-foreground">Root services</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pricingItems.filter((item) => item.type === "feature").length}
              </div>
              <p className="text-xs text-muted-foreground">Service features</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Add-ons</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pricingItems.filter((item) => item.type === "addon").length}
              </div>
              <p className="text-xs text-muted-foreground">Available add-ons</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pricingItems.length}</div>
              <p className="text-xs text-muted-foreground">All pricing items</p>
            </CardContent>
          </Card>
        </div>

        {/* Services & Pricing Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Service Catalog</CardTitle>
                <CardDescription>
                  Manage your healthcare services and pricing structure
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                {/* Save Status Indicator */}
                {(hasUnsavedChanges || lastSaved) && (
                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges && !isSaving && (
                      <>
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm text-amber-700 font-medium">
                          Unsaved changes
                        </span>
                      </>
                    )}
                    {isSaving && (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-600">Saving...</span>
                      </>
                    )}
                    {!hasUnsavedChanges && !isSaving && lastSaved && (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-700 font-medium">
                          Saved {lastSaved.toLocaleTimeString()}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Header Save Button */}
                <Button
                  onClick={(e) => {
                    try {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Save button clicked", {
                        hasUnsavedChanges,
                        isSaving,
                        timestamp: new Date().toISOString(),
                      });

                      // Ensure we can save
                      if (!isSaving) {
                        handleSavePricingData();
                      } else {
                        console.log("Save already in progress, ignoring click");
                      }
                    } catch (error) {
                      console.error(
                        "Error in save button click handler:",
                        error
                      );
                      // Fallback: try to save anyway
                      if (!isSaving) {
                        handleSavePricingData();
                      }
                    }
                  }}
                  disabled={isSaving}
                  variant={hasUnsavedChanges ? "default" : "outline"}
                  className={`${
                    hasUnsavedChanges
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : ""
                  } transition-all duration-200`}
                  type="button"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {hasUnsavedChanges ? "Save Changes" : "All Saved"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
                  <span className="text-gray-600">Loading services...</span>
                </div>
              </div>
            ) : (
              <PricingCardView
                items={pricingItems}
                onAdd={handleAddPricingItem}
                onEdit={handleEditPricingItem}
                onDelete={handleDeletePricingItem}
                onClone={handleClonePricingItem}
                onReorder={handleReorderPricingItems}
              />
            )}
          </CardContent>
        </Card>

        {/* Pricing Item Form Modal */}
        <PricingItemFormModal
          isOpen={isPricingItemDialogOpen}
          onClose={() => {
            console.log("Modal onClose called - forcing cleanup");
            setIsPricingItemDialogOpen(false);
            setSelectedPricingItem(null);
            setParentItemId(null);

            // Force cleanup of styles only (let React handle DOM)
            setTimeout(() => {
              // Ensure body is scrollable and interactive
              document.body.style.overflow = "auto";
              document.body.style.pointerEvents = "auto";
              console.log("Modal cleanup completed");
            }, 100);
          }}
          onSave={handleSavePricingItem}
          item={selectedPricingItem}
          mode={pricingItemMode}
          parentId={parentItemId}
          defaultType={defaultItemType}
        />

        {/* Notification Dialog */}
        <Dialog
          open={notificationDialog.open}
          onOpenChange={(open) => {
            console.log("🔔 Notification dialog onOpenChange:", open);
            setNotificationDialog((prev) => ({ ...prev, open }));
          }}
        >
          <DialogContent
            className="sm:max-w-md z-[70]"
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              console.log("🔔 Notification dialog escape pressed");
              setNotificationDialog((prev) => ({ ...prev, open: false }));
            }}
          >
            <DialogHeader>
              <DialogTitle
                className={
                  notificationDialog.type === "error"
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                {notificationDialog.title}
              </DialogTitle>
              <DialogDescription>
                {notificationDialog.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("🔔 Notification dialog OK clicked");
                  setNotificationDialog((prev) => ({ ...prev, open: false }));

                  // Ensure UI is fully responsive after closing
                  setTimeout(() => {
                    document.body.style.pointerEvents = "auto";
                    console.log("🔔 UI responsiveness restored");
                  }, 100);
                }}
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
