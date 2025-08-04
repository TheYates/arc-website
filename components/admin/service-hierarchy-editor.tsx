"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Check,
  ArrowRight,
  Diamond,
  Square,
} from "lucide-react";
import { ServiceItem, ServiceCategory } from "@/lib/api/services-sqlite";

interface HierarchyItem {
  id: string;
  name: string;
  isOptional: boolean;
  itemLevel: number;
  sortOrder: number;
  children: HierarchyItem[];
  isExpanded?: boolean;
  isEditing?: boolean;
}

interface ServiceHierarchyEditorProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  categories: ServiceCategory[];
  onSave: () => void;
}

export default function ServiceHierarchyEditor({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  categories,
  onSave,
}: ServiceHierarchyEditorProps) {
  const [hierarchyItems, setHierarchyItems] = useState<HierarchyItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HierarchyItem | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemOptional, setNewItemOptional] = useState(false);
  const [newItemLevel, setNewItemLevel] = useState(1);
  const [parentItemId, setParentItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<HierarchyItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0].id);
      loadHierarchyItems(categories[0].id);
    }
  }, [categories]);

  // Reload data when dialog opens
  useEffect(() => {
    if (isOpen && selectedCategory) {
      loadHierarchyItems(selectedCategory);
    }
  }, [isOpen, selectedCategory]);

  const loadHierarchyItems = async (categoryId: string) => {
    try {
      setLoading(true);
      // Fetch fresh data from API
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
        return <Diamond className="h-3 w-3 text-purple-500" />;
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
        return `Level ${level}`;
    }
  };

  const getIndentation = (level: number) => {
    return `ml-${(level - 1) * 4}`;
  };

  const handleAddItem = (parentId?: string, level: number = 1) => {
    setParentItemId(parentId || null);
    // If adding a child item, increment the level
    const newLevel = parentId ? level + 1 : 1;
    setNewItemLevel(newLevel);
    setNewItemName("");
    setNewItemOptional(false);
    setIsAddDialogOpen(true);
  };

  const handleSaveNewItem = async () => {
    if (!newItemName.trim()) return;

    try {
      // Create new item via API
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
            sortOrder: 999, // Will be reordered
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

  const handleClose = () => {
    onSave(); // Save any pending changes
    onClose();
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, item: HierarchyItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", item.id);
  };

  const handleDragOver = (e: React.DragEvent, targetItem: HierarchyItem) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverItem(targetItem.id);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = async (e: React.DragEvent, targetItem: HierarchyItem) => {
    e.preventDefault();
    setDragOverItem(null);

    if (!draggedItem || draggedItem.id === targetItem.id) {
      return;
    }

    try {
      // Update the dragged item to be a child of the target item
      const response = await fetch(
        `/api/services/${serviceId}/items/${draggedItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parentItemId: targetItem.id,
            itemLevel: targetItem.itemLevel + 1,
          }),
        }
      );

      if (response.ok) {
        loadHierarchyItems(selectedCategory);
        onSave();
      }
    } catch (error) {
      console.error("Error moving item:", error);
    }

    setDraggedItem(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this item and all its children?"
      )
    )
      return;

    try {
      const response = await fetch(
        `/api/services/${serviceId}/items/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        loadHierarchyItems(selectedCategory);
        onSave();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const toggleExpanded = (itemId: string) => {
    const updateExpanded = (items: HierarchyItem[]): HierarchyItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        return { ...item, children: updateExpanded(item.children) };
      });
    };
    setHierarchyItems(updateExpanded(hierarchyItems));
  };

  const renderHierarchyItem = (item: HierarchyItem, depth: number = 0) => {
    const hasChildren = item.children.length > 0;

    return (
      <div key={item.id} className="space-y-1">
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => handleDragOver(e, item)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item)}
          className={`flex items-center gap-2 p-2 rounded border hover:bg-gray-50 cursor-move transition-colors ${getIndentation(
            item.itemLevel
          )} ${dragOverItem === item.id ? "bg-blue-50 border-blue-300" : ""}`}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleExpanded(item.id)}
            >
              {item.isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-6" />}

          {/* Drag Handle */}
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />

          {/* Level Icon */}
          {getLevelIcon(item.itemLevel)}

          {/* Item Content */}
          <div className="flex-1 flex items-center gap-2">
            <span
              className={`${
                item.itemLevel === 1 ? "font-semibold text-base" : "text-sm"
              }`}
            >
              {item.name}
            </span>
            {item.isOptional && (
              <Badge variant="outline" className="text-xs">
                Optional
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {getLevelLabel(item.itemLevel)}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleAddItem(item.id, item.itemLevel + 1)}
              title="Add child item"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setEditingItem(item)}
              title="Edit item"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              onClick={() => handleDeleteItem(item.id)}
              title="Delete item"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && item.isExpanded && (
          <div className="space-y-1">
            {item.children.map((child) =>
              renderHierarchyItem(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hierarchy Editor - {serviceName}</DialogTitle>
          <DialogDescription>
            Manage the hierarchical structure of service items with visual level
            indicators
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-4">
            <div className="flex gap-4 items-center mb-4">
              <Label>Category:</Label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  loadHierarchyItems(e.target.value);
                }}
                className="border rounded px-3 py-1"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Button onClick={() => handleAddItem(undefined, 1)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Root Item
              </Button>
            </div>

            {/* Level Legend */}
            <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded">
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
                <Diamond className="h-3 w-3 text-purple-500" />
                <span className="text-sm">Level 4 (Sub-sub-item)</span>
              </div>
            </div>

            {/* Hierarchy Tree */}
            <div className="border rounded p-4 min-h-[300px] bg-white">
              {loading ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    Loading hierarchy...
                  </div>
                </div>
              ) : hierarchyItems.length > 0 ? (
                <div className="space-y-1">
                  {hierarchyItems.map((item) => renderHierarchyItem(item))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No items found. Click "Add Root Item" to get started.
                </div>
              )}
            </div>
          </div>

          {/* Add Item Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogDescription>
                  Add a new item at level {newItemLevel}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter item name..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="optional"
                    checked={newItemOptional}
                    onCheckedChange={setNewItemOptional}
                  />
                  <Label htmlFor="optional">Optional item</Label>
                </div>
                <div className="flex items-center gap-2">
                  {getLevelIcon(newItemLevel)}
                  <span className="text-sm font-medium">
                    {getLevelLabel(newItemLevel)}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveNewItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
