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
  Package,
  TrendingUp,
  Users,
  DollarSign,

  Save,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PricingCardView } from "@/components/admin/pricing-card-view";
import PricingItemFormModal from "@/components/admin/pricing-item-form-modal";


import type { PricingItem } from "@/lib/types/packages";

export default function AdminPackagesPage() {
  const { user } = useAuth();

  // Pricing tree view state - will be loaded from pricing.json
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);

  // Load services from pricing.json (consistent with rest of app)
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch('/api/admin/pricing');
        const result = await response.json();

        if (result.success && result.data) {
          // Add color themes to services based on their names
          const servicesWithColors = result.data.map((item: PricingItem) => {
            if (item.type === 'service') {
              const colorMap: Record<string, string> = {
                'AHENEFIE': 'teal',
                'ADAMFO PA': 'blue',
                'FIE NE FIE': 'purple',
                'YONKO PA': 'indigo',
                'EVENT MEDICAL COVERAGE': 'red',
                'CONFERENCE OPTION': 'green'
              };
              return {
                ...item,
                colorTheme: colorMap[item.name] || 'teal'
              };
            }
            return item;
          });
          setPricingItems(servicesWithColors);
        } else {
          console.error('Failed to load services:', result.error);
          setPricingItems([]);
        }
      } catch (error) {
        console.error('Error loading services:', error);
        setPricingItems([]);
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

  // Manual save function - memoized to prevent stale closures
  const handleSavePricingData = useCallback(async () => {
    try {
      console.log("handleSavePricingData called", {
        hasUnsavedChanges,
        isSaving,
        itemsCount: pricingItems.length,
      });

      setIsSaving(true);
      const response = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: pricingItems }),
      });

      if (!response.ok) {
        throw new Error("Failed to save pricing data");
      }

      const result = await response.json();
      console.log("Save result:", result);

      if (result.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        console.log("Save successful, state updated");
      } else {
        throw new Error(result.error || "Failed to save pricing data");
      }
    } catch (error) {
      console.error("Error saving pricing data:", error);
      // You might want to show a toast notification here
      alert("Failed to save changes. Please try again.");
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
          console.warn("Modal has been open for more than 5 minutes, might be frozen");
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

  // Check if user is admin
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the packages management page.
            </CardDescription>
          </CardHeader>
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
    setPricingItems((prev) => removeItemFromTree(prev, item.id));
    setHasUnsavedChanges(true);
    console.log("Item deleted, hasUnsavedChanges set to true");
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

  const handleSavePricingItem = useCallback(async (itemData: Partial<PricingItem>) => {
    try {
      console.log("handleSavePricingItem called with:", itemData);
      console.log("Current modal state:", { isPricingItemDialogOpen, pricingItemMode, parentItemId });

      if (pricingItemMode === "create") {
        const newItem: PricingItem = {
          id: `item_${Date.now()}`,
          name: itemData.name || "",
          description: itemData.description,
          type: itemData.type || "service",
          basePrice: itemData.basePrice || 0,
          isRequired:
            itemData.isRequired !== undefined ? itemData.isRequired : true,
          isRecurring:
            itemData.isRecurring !== undefined ? itemData.isRecurring : true,
          isMutuallyExclusive: itemData.isMutuallyExclusive || false,
          parentId: parentItemId,
          sortOrder: itemData.sortOrder || 0,
          children: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log("Adding new item to tree:", newItem);
        setPricingItems((prev) => addItemToTree(prev, newItem, parentItemId));
        console.log("New item created, setting hasUnsavedChanges to true");
        setHasUnsavedChanges(true);
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
          parentItemId: null
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
  }, [pricingItemMode, parentItemId, selectedPricingItem, isPricingItemDialogOpen]);

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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Services & Pricing
          </h1>
          <p className="text-muted-foreground">
            Manage your services, plans, features and pricing hierarchy
          </p>
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
              <CardTitle>Pricing Structure</CardTitle>
              <CardDescription>
                Manage your services hierarchy and pricing configuration
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
                    console.error("Error in save button click handler:", error);
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
          <PricingCardView
            items={pricingItems}
            onAdd={handleAddPricingItem}
            onEdit={handleEditPricingItem}
            onDelete={handleDeletePricingItem}
            onClone={handleClonePricingItem}
            onReorder={handleReorderPricingItems}
          />
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

          // Force cleanup of any potential DOM issues
          setTimeout(() => {
            // Remove any lingering modal overlays
            const overlays = document.querySelectorAll('[data-radix-popper-content-wrapper]');
            overlays.forEach(overlay => overlay.remove());

            // Ensure body is scrollable
            document.body.style.overflow = 'auto';
            document.body.style.pointerEvents = 'auto';

            // Remove any potential backdrop elements
            const backdrops = document.querySelectorAll('[data-state="open"]');
            backdrops.forEach(backdrop => {
              if (backdrop.getAttribute('role') === 'dialog') {
                backdrop.remove();
              }
            });

            console.log("Modal cleanup completed");
          }, 100);
        }}
        onSave={handleSavePricingItem}
        item={selectedPricingItem}
        mode={pricingItemMode}
        parentId={parentItemId}
        defaultType={defaultItemType}
      />


    </div>
  );
}
