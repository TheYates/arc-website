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
  Clock,
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
    orange: {
      border: "border-orange-500",
      bg: "from-orange-50 to-orange-100",
      hover: "hover:from-orange-100 hover:to-orange-200",
      badge: "text-orange-600 border-orange-300 bg-orange-50",
      text: "text-orange-700",
    },
    amber: {
      border: "border-amber-500",
      bg: "from-amber-50 to-amber-100",
      hover: "hover:from-amber-100 hover:to-amber-200",
      badge: "text-amber-600 border-amber-300 bg-amber-50",
      text: "text-amber-700",
    },
    yellow: {
      border: "border-yellow-500",
      bg: "from-yellow-50 to-yellow-100",
      hover: "hover:from-yellow-100 hover:to-yellow-200",
      badge: "text-yellow-600 border-yellow-300 bg-yellow-50",
      text: "text-yellow-700",
    },
    lime: {
      border: "border-lime-500",
      bg: "from-lime-50 to-lime-100",
      hover: "hover:from-lime-100 hover:to-lime-200",
      badge: "text-lime-600 border-lime-300 bg-lime-50",
      text: "text-lime-700",
    },
    emerald: {
      border: "border-emerald-500",
      bg: "from-emerald-50 to-emerald-100",
      hover: "hover:from-emerald-100 hover:to-emerald-200",
      badge: "text-emerald-600 border-emerald-300 bg-emerald-50",
      text: "text-emerald-700",
    },
    cyan: {
      border: "border-cyan-500",
      bg: "from-cyan-50 to-cyan-100",
      hover: "hover:from-cyan-100 hover:to-cyan-200",
      badge: "text-cyan-600 border-cyan-300 bg-cyan-50",
      text: "text-cyan-700",
    },
    sky: {
      border: "border-sky-500",
      bg: "from-sky-50 to-sky-100",
      hover: "hover:from-sky-100 hover:to-sky-200",
      badge: "text-sky-600 border-sky-300 bg-sky-50",
      text: "text-sky-700",
    },
    violet: {
      border: "border-violet-500",
      bg: "from-violet-50 to-violet-100",
      hover: "hover:from-violet-100 hover:to-violet-200",
      badge: "text-violet-600 border-violet-300 bg-violet-50",
      text: "text-violet-700",
    },
    fuchsia: {
      border: "border-fuchsia-500",
      bg: "from-fuchsia-50 to-fuchsia-100",
      hover: "hover:from-fuchsia-100 hover:to-fuchsia-200",
      badge: "text-fuchsia-600 border-fuchsia-300 bg-fuchsia-50",
      text: "text-fuchsia-700",
    },
    pink: {
      border: "border-pink-500",
      bg: "from-pink-50 to-pink-100",
      hover: "hover:from-pink-100 hover:to-pink-200",
      badge: "text-pink-600 border-pink-300 bg-pink-50",
      text: "text-pink-700",
    },
    rose: {
      border: "border-rose-500",
      bg: "from-rose-50 to-rose-100",
      hover: "hover:from-rose-100 hover:to-rose-200",
      badge: "text-rose-600 border-rose-300 bg-rose-50",
      text: "text-rose-700",
    },
    slate: {
      border: "border-slate-500",
      bg: "from-slate-50 to-slate-100",
      hover: "hover:from-slate-100 hover:to-slate-200",
      badge: "text-slate-600 border-slate-300 bg-slate-50",
      text: "text-slate-700",
    },
    gray: {
      border: "border-gray-500",
      bg: "from-gray-50 to-gray-100",
      hover: "hover:from-gray-100 hover:to-gray-200",
      badge: "text-gray-600 border-gray-300 bg-gray-50",
      text: "text-gray-700",
    },
    zinc: {
      border: "border-zinc-500",
      bg: "from-zinc-50 to-zinc-100",
      hover: "hover:from-zinc-100 hover:to-zinc-200",
      badge: "text-zinc-600 border-zinc-300 bg-zinc-50",
      text: "text-zinc-700",
    },
    neutral: {
      border: "border-neutral-500",
      bg: "from-neutral-50 to-neutral-100",
      hover: "hover:from-neutral-100 hover:to-neutral-200",
      badge: "text-neutral-600 border-neutral-300 bg-neutral-50",
      text: "text-neutral-700",
    },
    stone: {
      border: "border-stone-500",
      bg: "from-stone-50 to-stone-100",
      hover: "hover:from-stone-100 hover:to-stone-200",
      badge: "text-stone-600 border-stone-300 bg-stone-50",
      text: "text-stone-700",
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
  onToggleComingSoon?: (item: PricingItem) => void;
  onReorder: (items: PricingItem[]) => void;
}

export function PricingCardView({
  items,
  onAdd,
  onEdit,
  onDelete,
  onClone,
  onToggleComingSoon,
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
                        {/* Coming Soon badge for services */}
                        {item.comingSoon && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Coming Soon
                          </Badge>
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
                    {/* Coming Soon toggle button */}
                    {onToggleComingSoon && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComingSoon(item);
                        }}
                        className={`h-8 w-8 p-0 ${
                          item.comingSoon 
                            ? 'text-amber-600 hover:text-amber-700' 
                            : 'text-gray-400 hover:text-amber-600'
                        }`}
                        title={item.comingSoon ? "Mark as available" : "Mark as coming soon"}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
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
                            {/* Removed optional price display */}
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
                        {/* Removed optional price display */}
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
