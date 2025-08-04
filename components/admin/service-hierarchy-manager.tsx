"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice, formatOptionalPrice } from "@/lib/utils";
import { TreeView, TreeNode } from "@/components/ui/tree-view";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Check,
  Square,
  ArrowRight,
  Diamond,
} from "lucide-react";

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
  priceHourly: number;
  priceDaily: number;
  priceMonthly: number;
  createdAt: string;
  updatedAt: string;
}

interface HierarchyItem {
  id: string;
  name: string;
  isOptional: boolean;
  itemLevel: number;
  sortOrder: number;
  priceHourly: number;
  priceDaily: number;
  priceMonthly: number;
  children: HierarchyItem[];
  isExpanded: boolean;
}

interface ServiceHierarchyManagerProps {
  serviceId: string;
  categories: ServiceCategory[];
  onSave: () => void;
}

export function ServiceHierarchyManager({
  serviceId,
  categories,
  onSave,
}: ServiceHierarchyManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [hierarchyItems, setHierarchyItems] = useState<HierarchyItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Add item dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemOptional, setNewItemOptional] = useState(false);
  const [newItemLevel, setNewItemLevel] = useState(1);
  const [parentItemId, setParentItemId] = useState<string | null>(null);

  // Pricing state
  const [newItemPriceHourly, setNewItemPriceHourly] = useState<number>(0);
  const [newItemPriceDaily, setNewItemPriceDaily] = useState<number>(0);
  const [newItemPriceMonthly, setNewItemPriceMonthly] = useState<number>(0);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0].id);
      loadHierarchyItems(categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    if (selectedCategory) {
      loadHierarchyItems(selectedCategory);
    }
  }, [selectedCategory]);

  const loadHierarchyItems = async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        const service = data.service;
        const category = service.categories?.find(
          (c: any) => c.id === categoryId
        );
        if (category?.items) {
          const items = convertToHierarchy(category.items);
          setHierarchyItems(items);
        }
      }
    } catch (error) {
      console.error("Error loading hierarchy items:", error);
    } finally {
      setLoading(false);
    }
  };

  const convertToHierarchy = (items: ServiceItem[]): HierarchyItem[] => {
    const itemMap = new Map<string, HierarchyItem>();
    const rootItems: HierarchyItem[] = [];

    // Convert to HierarchyItem format
    items.forEach((item) => {
      const hierarchyItem: HierarchyItem = {
        id: item.id,
        name: item.name,
        isOptional: item.isOptional,
        itemLevel: item.itemLevel,
        sortOrder: item.sortOrder,
        priceHourly: item.priceHourly || 0,
        priceDaily: item.priceDaily || 0,
        priceMonthly: item.priceMonthly || 0,
        children: [],
        isExpanded: true,
      };
      itemMap.set(item.id, hierarchyItem);
    });

    // Build parent-child relationships
    items.forEach((item) => {
      const hierarchyItem = itemMap.get(item.id)!;
      if (item.parentItemId) {
        const parent = itemMap.get(item.parentItemId);
        if (parent) {
          parent.children.push(hierarchyItem);
        } else {
          // If parent not found, treat as root item
          rootItems.push(hierarchyItem);
        }
      } else {
        rootItems.push(hierarchyItem);
      }
    });

    // Sort children within each parent
    const sortChildren = (items: HierarchyItem[]) => {
      items.forEach((item) => {
        if (item.children.length > 0) {
          item.children.sort((a, b) => a.sortOrder - b.sortOrder);
          sortChildren(item.children);
        }
      });
    };

    rootItems.sort((a, b) => a.sortOrder - b.sortOrder);
    sortChildren(rootItems);

    return rootItems;
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Square className="h-4 w-4 text-gray-800" />;
      case 2:
        return <Check className="h-4 w-4 text-green-500" />;
      case 3:
        return <ArrowRight className="h-4 w-4 text-blue-500" />;
      case 4:
        return <Diamond className="h-4 w-4 text-purple-500" />;
      default:
        return <Check className="h-4 w-4 text-green-500" />;
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Main Category";
      case 2:
        return "Primary Item";
      case 3:
        return "Sub-item";
      case 4:
        return "Sub-sub-item";
      default:
        return "Item";
    }
  };

  const handleAddItem = (parentId?: string, level: number = 1) => {
    setParentItemId(parentId || null);
    // If adding a child item, increment the level
    const newLevel = parentId ? level + 1 : 1;
    setNewItemLevel(newLevel);
    setNewItemName("");
    setNewItemOptional(false);
    // Reset pricing
    setNewItemPriceHourly(0);
    setNewItemPriceDaily(0);
    setNewItemPriceMonthly(0);
    setIsAddDialogOpen(true);
  };

  const convertToTreeNodes = (items: HierarchyItem[]): TreeNode[] => {
    return items.map((item) => ({
      id: item.id,
      label: (
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            {getLevelIcon(item.itemLevel)}
            <span className="font-medium">{item.name}</span>
          </div>

          {item.isOptional && (
            <Badge variant="outline" className="text-xs">
              Optional
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {getLevelLabel(item.itemLevel)}
          </Badge>

          {/* Show pricing for optional items */}
          {item.isOptional &&
            (item.priceHourly > 0 ||
              item.priceDaily > 0 ||
              item.priceMonthly > 0) && (
              <div className="flex gap-1 text-xs text-green-600">
                {item.priceDaily > 0 && (
                  <span>{formatOptionalPrice(item.priceDaily)}</span>
                )}
              </div>
            )}
        </div>
      ),
      actions: (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddItem(item.id, item.itemLevel);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditItem(item);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteItem(item.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      children:
        item.children.length > 0
          ? convertToTreeNodes(item.children)
          : undefined,
      isExpanded: item.isExpanded,
      icon: <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />,
    }));
  };

  const handleEditItem = (item: HierarchyItem) => {
    // TODO: Implement edit functionality
    // For now, just show an alert
    alert(`Edit functionality for "${item.name}" will be implemented soon.`);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/services/${serviceId}/items/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh the hierarchy
        loadHierarchyItems(selectedCategory);
        onSave();
      } else {
        alert("Failed to delete item. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Please try again.");
    }
  };

  const handleSaveNewItem = async () => {
    if (!newItemName.trim()) return;

    try {
      const response = await fetch(
        `/api/services/${serviceId}/categories/${selectedCategory}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newItemName,
            isOptional: newItemOptional,
            itemLevel: newItemLevel,
            parentItemId: parentItemId,
            sortOrder: 999,
            priceHourly: newItemPriceHourly,
            priceDaily: newItemPriceDaily,
            priceMonthly: newItemPriceMonthly,
          }),
        }
      );

      if (response.ok) {
        setIsAddDialogOpen(false);
        loadHierarchyItems(selectedCategory);
        onSave();
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Service Items Hierarchy</CardTitle>
          <Button onClick={() => handleAddItem()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Root Item
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="category">Category:</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Level Legend */}
        <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Square className="h-4 w-4 text-gray-800" />
            <span className="text-sm">Level 1 (Main)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">Level 2 (Primary)</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Level 3 (Sub-item)</span>
          </div>
          <div className="flex items-center gap-2">
            <Diamond className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Level 4 (Sub-sub-item)</span>
          </div>
        </div>

        {/* Hierarchy Tree View */}
        <div className="border rounded-lg">
          {loading ? (
            <div className="text-center py-8">Loading items...</div>
          ) : hierarchyItems.length > 0 ? (
            <TreeView
              data={convertToTreeNodes(hierarchyItems)}
              onNodeToggle={(nodeId, isExpanded) => {
                // Update the expanded state in hierarchyItems
                const updateExpanded = (
                  items: HierarchyItem[]
                ): HierarchyItem[] => {
                  return items.map((item) => {
                    if (item.id === nodeId) {
                      return { ...item, isExpanded };
                    }
                    if (item.children.length > 0) {
                      return {
                        ...item,
                        children: updateExpanded(item.children),
                      };
                    }
                    return item;
                  });
                };
                setHierarchyItems(updateExpanded(hierarchyItems));
              }}
              className="p-2"
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No items found. Add your first item to get started.
            </div>
          )}
        </div>
      </CardContent>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="optional"
                checked={newItemOptional}
                onCheckedChange={setNewItemOptional}
              />
              <Label htmlFor="optional">Optional item</Label>
            </div>

            {/* Pricing fields for optional items */}
            {newItemOptional && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <Label className="text-sm font-medium">
                  Pricing (for optional items)
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="priceHourly" className="text-xs">
                      Hourly Rate
                    </Label>
                    <Input
                      id="priceHourly"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItemPriceHourly}
                      onChange={(e) =>
                        setNewItemPriceHourly(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priceDaily" className="text-xs">
                      Daily Rate
                    </Label>
                    <Input
                      id="priceDaily"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItemPriceDaily}
                      onChange={(e) =>
                        setNewItemPriceDaily(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priceMonthly" className="text-xs">
                      Monthly Rate
                    </Label>
                    <Input
                      id="priceMonthly"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItemPriceMonthly}
                      onChange={(e) =>
                        setNewItemPriceMonthly(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set prices for this optional item. Leave as 0.00 if no
                  additional charge.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              {getLevelIcon(newItemLevel)}
              <span className="text-sm font-medium">
                {getLevelLabel(newItemLevel)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
