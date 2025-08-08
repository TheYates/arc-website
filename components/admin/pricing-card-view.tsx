"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Copy,
  GripVertical,
  MoreVertical,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import type { PricingItem } from "@/lib/types/packages";

// Color theme mapping for services
const getServiceColorClasses = (colorTheme: string = "teal") => {
  const colorMap = {
    teal: {
      border: "border-teal-500",
      bg: "from-teal-50 to-teal-100",
      hover: "hover:from-teal-100 hover:to-teal-200",
      badge: "text-teal-600 border-teal-300 bg-teal-50",
      text: "text-teal-700",
    },
    blue: {
      border: "border-blue-500",
      bg: "from-blue-50 to-blue-100",
      hover: "hover:from-blue-100 hover:to-blue-200",
      badge: "text-blue-600 border-blue-300 bg-blue-50",
      text: "text-blue-700",
    },
    purple: {
      border: "border-purple-500",
      bg: "from-purple-50 to-purple-100",
      hover: "hover:from-purple-100 hover:to-purple-200",
      badge: "text-purple-600 border-purple-300 bg-purple-50",
      text: "text-purple-700",
    },
    indigo: {
      border: "border-indigo-500",
      bg: "from-indigo-50 to-indigo-100",
      hover: "hover:from-indigo-100 hover:to-indigo-200",
      badge: "text-indigo-600 border-indigo-300 bg-indigo-50",
      text: "text-indigo-700",
    },
    red: {
      border: "border-red-500",
      bg: "from-red-50 to-red-100",
      hover: "hover:from-red-100 hover:to-red-200",
      badge: "text-red-600 border-red-300 bg-red-50",
      text: "text-red-700",
    },
    green: {
      border: "border-green-500",
      bg: "from-green-50 to-green-100",
      hover: "hover:from-green-100 hover:to-green-200",
      badge: "text-green-600 border-green-300 bg-green-50",
      text: "text-green-700",
    },
  };

  return colorMap[colorTheme as keyof typeof colorMap] || colorMap.teal;
};

interface PricingCardViewProps {
  items: PricingItem[];
  onAdd: (parentId: string | null, type: PricingItem["type"]) => void;
  onEdit: (item: PricingItem) => void;
  onDelete: (item: PricingItem) => void;
  onClone: (item: PricingItem) => void;
  onReorder: (items: PricingItem[]) => void;
}

export function PricingCardView({
  items,
  onAdd,
  onEdit,
  onDelete,
  onClone,
  onReorder,
}: PricingCardViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PricingItem | null>(null);

  // Auto-expand first service and its first feature for better UX
  React.useEffect(() => {
    if (items.length > 0 && expandedItems.size === 0) {
      const firstService = items.find((item) => item.type === "service");
      if (firstService) {
        const toExpand = new Set([firstService.id]);
        if (firstService.children && firstService.children.length > 0) {
          const firstFeature = firstService.children.find(
            (child) => child.type === "feature"
          );
          if (firstFeature) {
            toExpand.add(firstFeature.id);
          }
        }
        setExpandedItems(toExpand);
      }
    }
  }, [items, expandedItems.size]);

  // Cleanup delete dialog state when component unmounts or items change
  React.useEffect(() => {
    return () => {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    };
  }, []);

  // Reset delete dialog if the item to delete no longer exists
  React.useEffect(() => {
    if (itemToDelete && deleteConfirmOpen) {
      const itemExists = items.some((item) => {
        const findItem = (currentItem: PricingItem): boolean => {
          if (currentItem.id === itemToDelete.id) return true;
          return currentItem.children?.some(findItem) || false;
        };
        return findItem(item);
      });

      if (!itemExists) {
        console.log("Item to delete no longer exists, closing dialog");
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
      }
    }
  }, [items, itemToDelete, deleteConfirmOpen]);

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleDeleteClick = (item: PricingItem) => {
    console.log("Delete clicked for:", item.name);
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    console.log("🗑️ Delete confirmed for:", itemToDelete.name);

    // Close dialog immediately to prevent UI conflicts
    setDeleteConfirmOpen(false);

    // Small delay to ensure dialog is fully closed
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      console.log("🗑️ Calling onDelete...");
      await onDelete(itemToDelete);
      console.log("✅ Delete completed successfully");
    } catch (error) {
      console.error("💥 Error during delete:", error);
      // Error handling is now done in the parent component
    } finally {
      // Clean up state
      setItemToDelete(null);

      // Ensure UI is responsive
      setTimeout(() => {
        document.body.style.pointerEvents = "auto";
        document.body.style.overflow = "auto";
        console.log("🗑️ Delete cleanup completed");
      }, 100);
    }
  };

  const handleDeleteCancel = () => {
    console.log("Delete cancelled");
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const getTypeColor = (type: PricingItem["type"]) => {
    switch (type) {
      case "service":
        return "text-teal-600";
      case "feature":
        return "text-green-600";
      case "addon":
        return "text-purple-600";
      default:
        return "text-slate-600";
    }
  };

  const getTypeIcon = (type: PricingItem["type"]) => {
    switch (type) {
      case "service":
        return "🏠";
      case "feature":
        return "✅";
      case "addon":
        return "🔧";
      default:
        return "📄";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const renderServiceItem = (
    item: PricingItem,
    level: number = 1
  ): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const typeColor = getTypeColor(item.type);
    const typeIcon = getTypeIcon(item.type);

    // Get color theme from item (assuming it's added to PricingItem type)
    const colorTheme = (item as any).colorTheme || "teal";
    const colors = getServiceColorClasses(colorTheme);

    // Service level (top-level cards) - Now collapsible
    if (item.type === "service") {
      return (
        <Card
          key={item.id}
          className={`overflow-hidden border-l-4 ${colors.border}`}
        >
          <Collapsible
            open={isExpanded}
            onOpenChange={() => toggleItemExpansion(item.id)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader
                className={`bg-gradient-to-r ${colors.bg} cursor-pointer ${colors.hover} transition-colors py-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <CardTitle
                        className={`text-lg ${colors.text} flex items-center gap-2`}
                      >
                        {item.name}
                        {/* Display base price as text only */}
                        {item.basePrice && item.basePrice > 0 && (
                          <span
                            className={`text-sm font-normal ${colors.text}/70`}
                          >
                            Base: {formatPrice(item.basePrice)}
                          </span>
                        )}
                      </CardTitle>
                      {item.description && (
                        <p className="text-slate-600 mt-1 text-sm">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdd(item.id, "feature");
                      }}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Feature
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Service
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onClone(item)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Clone Service
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(item);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Service
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Collapse/Expand indicator */}
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {hasChildren ? (
                    item.children?.map((child) => renderNestedItem(child, 2))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <p>No features created yet</p>
                      <Button
                        variant="outline"
                        onClick={() => onAdd(item.id, "feature")}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Feature
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      );
    }

    return null;
  };

  const renderNestedItem = (
    item: PricingItem,
    level: number
  ): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const typeColor = getTypeColor(item.type);
    const typeIcon = getTypeIcon(item.type);

    const indentClass = level === 2 ? "ml-0" : level === 3 ? "ml-6" : "ml-12";

    let borderColor = "border-slate-200";
    if (item.type === "feature") borderColor = "border-green-200";
    else if (item.type === "addon") borderColor = "border-purple-200";

    return (
      <div
        key={item.id}
        className={`${indentClass} border-l-4 ${borderColor} pl-4 rounded-l`}
      >
        {hasChildren ? (
          <Collapsible
            open={isExpanded}
            onOpenChange={() => toggleItemExpansion(item.id)}
          >
            <CollapsibleTrigger asChild>
              <div className="cursor-pointer hover:bg-slate-50 rounded p-2 transition-colors border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3 w-3 text-slate-400 cursor-grab" />
                    <span className="text-base">{typeIcon}</span>
                    <div>
                      <h4
                        className={`font-medium ${typeColor} flex items-center gap-2 text-sm`}
                      >
                        {item.name}
                        {!item.isRequired && (
                          <span className="text-orange-600 text-xs">
                            Optional
                            {item.basePrice && item.basePrice > 0 && (
                              <span className="ml-1 text-green-600">
                                +{formatPrice(item.basePrice)}
                              </span>
                            )}
                            {(!item.basePrice || item.basePrice === 0) && (
                              <span className="ml-1 text-gray-500">
                                +{formatPrice(0)}
                              </span>
                            )}
                          </span>
                        )}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onClone(item)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Clone
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {item.type === "service" && (
                          <DropdownMenuItem
                            onClick={() => onAdd(item.id, "feature")}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Feature
                          </DropdownMenuItem>
                        )}
                        {(item.type === "feature" || item.type === "addon") && (
                          <DropdownMenuItem
                            onClick={() => onAdd(item.id, "addon")}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Add-on
                          </DropdownMenuItem>
                        )}
                        {(item.type === "service" ||
                          item.type === "feature" ||
                          item.type === "addon") && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(item);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="mt-1 space-y-1">
                {item.children?.map((child) =>
                  renderNestedItem(child, level + 1)
                )}
                {(!item.children || item.children.length === 0) && (
                  <div className="text-center py-2 text-slate-500 text-xs">
                    <p>
                      No {item.type === "feature" ? "add-ons" : "items"} created
                      yet
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="hover:bg-slate-50 rounded p-2 transition-colors border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-3 w-3 text-slate-400 cursor-grab" />
                <span className="text-base">{typeIcon}</span>
                <div>
                  <h4
                    className={`font-medium ${typeColor} flex items-center gap-2 text-sm`}
                  >
                    {item.name}
                    {!item.isRequired && (
                      <span className="text-orange-600 text-xs">
                        Optional
                        {item.basePrice && item.basePrice > 0 && (
                          <span className="ml-1 text-green-600">
                            +{formatPrice(item.basePrice)}
                          </span>
                        )}
                        {(!item.basePrice || item.basePrice === 0) && (
                          <span className="ml-1 text-gray-500">
                            +{formatPrice(0)}
                          </span>
                        )}
                      </span>
                    )}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onClone(item)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Clone
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {item.type === "service" && (
                      <DropdownMenuItem
                        onClick={() => onAdd(item.id, "feature")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </DropdownMenuItem>
                    )}
                    {(item.type === "feature" || item.type === "addon") && (
                      <DropdownMenuItem onClick={() => onAdd(item.id, "addon")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Add-on
                      </DropdownMenuItem>
                    )}
                    {(item.type === "service" ||
                      item.type === "feature" ||
                      item.type === "addon") && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick(item);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const services = items.filter((item) => item.type === "service");

  return (
    <div className="space-y-3">
      {services.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 text-6xl mb-4">🏠</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No services created yet
          </h3>
          <p className="text-slate-600 mb-4">
            Create your first service to get started
          </p>
          <Button
            onClick={() => onAdd(null, "service")}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Service
          </Button>
        </div>
      ) : (
        <>
          {services.map((service) => renderServiceItem(service))}
          <div className="text-center pt-6">
            <Button
              variant="outline"
              onClick={() => onAdd(null, "service")}
              className="border-dashed border-2 border-teal-300 text-teal-600 hover:bg-teal-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Service
            </Button>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog - Using AlertDialog to avoid conflicts with existing modals */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDeleteCancel();
          }
        }}
      >
        <AlertDialogContent
          className="sm:max-w-md z-[60]"
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleDeleteCancel();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{itemToDelete?.name}"</strong>?
              {itemToDelete?.children && itemToDelete.children.length > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  ⚠️ This will also delete {itemToDelete.children.length} child
                  item(s).
                </span>
              )}
              <span className="block mt-2 text-sm text-muted-foreground">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteCancel();
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteConfirm();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
