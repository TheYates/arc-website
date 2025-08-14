"use client";

import { useState } from "react";
import { PricingTreeView } from "@/components/ui/pricing-tree-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { PricingItem } from "@/lib/types/pricing";

// Sample data for demonstration
// const sampleData: PricingItem[] = [
//   {
//     id: "service-1",
//     name: "Home Care Service",
//     description: "Professional medical care and support in the comfort of your home",
//     type: "service",
//     basePrice: 150,
//     isRequired: true,
//     isRecurring: true,
//     children: [
//       {
//         id: "plan-1",
//         name: "AHENEFIE Plan",
//         description: "24/7 live-in home care with dedicated nursing support",
//         type: "plan",
//         basePrice: 150,
//         isRequired: false,
//         isRecurring: true,
//         children: [
//           {
//             id: "feature-1",
//             name: "Emergency Response",
//             description: "24/7 emergency medical response",
//             type: "feature",
//             basePrice: 0,
//             isRequired: true,
//             children: [
//               {
//                 id: "subfeature-1",
//                 name: "Ambulance Service",
//                 description: "Emergency ambulance dispatch",
//                 type: "subFeature",
//                 basePrice: 50,
//                 isRequired: false,
//               }
//             ]
//           },
//           {
//             id: "feature-2",
//             name: "Medication Management",
//             description: "Professional medication administration and monitoring",
//             type: "feature",
//             basePrice: 25,
//             isRequired: false,
//           }
//         ]
//       },
//       {
//         id: "plan-2",
//         name: "ADAMFO PA Plan",
//         description: "Professional daily home visits with flexible scheduling",
//         type: "plan",
//         basePrice: 80,
//         isRequired: false,
//         isRecurring: false,
//       }
//     ]
//   }
// ]

export default function ServicesPricingPage() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "service" as PricingItem["type"],
    basePrice: "",
    isRequired: false,
    isRecurring: false,
    isMutuallyExclusive: false,
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "service",
      basePrice: "",
      isRequired: false,
      isRecurring: false,
      isMutuallyExclusive: false,
    });
    setEditingItem(null);
  };

  const handleAdd = (parentId: string | null, type: PricingItem["type"]) => {
    setFormData((prev) => ({ ...prev, type }));
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: PricingItem) => {
    setFormData({
      name: item.name,
      description: item.description || "",
      type: item.type,
      basePrice: item.basePrice?.toString() || "",
      isRequired: item.isRequired || false,
      isRecurring: item.isRecurring || false,
      isMutuallyExclusive: item.isMutuallyExclusive || false,
    });
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const deleteFromItems = (items: PricingItem[]): PricingItem[] => {
      return items.filter((item) => {
        if (item.id === id) return false;
        if (item.children) {
          item.children = deleteFromItems(item.children);
        }
        return true;
      });
    };
    setItems(deleteFromItems(items));
  };

  const handleClone = (item: PricingItem) => {
    const cloneItem = (original: PricingItem): PricingItem => ({
      ...original,
      id: generateId(),
      name: `${original.name} (Copy)`,
      children: original.children?.map(cloneItem),
    });

    const cloned = cloneItem(item);
    setItems((prev) => [...prev, cloned]);
  };

  const clearAllData = () => {
    setItems([]);
  };

  const handleSave = () => {
    const newItem: PricingItem = {
      id: editingItem?.id || generateId(),
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      basePrice: formData.basePrice
        ? parseFloat(formData.basePrice)
        : undefined,
      isRequired: formData.isRequired,
      isRecurring: formData.isRecurring,
      isMutuallyExclusive: formData.isMutuallyExclusive,
      children: editingItem?.children || [],
    };

    if (editingItem) {
      // Update existing item
      const updateInItems = (items: PricingItem[]): PricingItem[] => {
        return items.map((item) => {
          if (item.id === editingItem.id) {
            return newItem;
          }
          if (item.children) {
            return { ...item, children: updateInItems(item.children) };
          }
          return item;
        });
      };
      setItems(updateInItems(items));
    } else {
      // Add new item
      setItems((prev) => [...prev, newItem]);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services & Pricing Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your service hierarchy, plans, features, and pricing
            structure.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <PricingTreeView
            items={items}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClone={handleClone}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter item name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter description (optional)"
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: PricingItem["type"]) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="plan">Plan</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="subFeature">Sub Feature</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="basePrice">Base Price</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    basePrice: e.target.value,
                  }))
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRequired"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isRequired: !!checked }))
                  }
                />
                <Label htmlFor="isRequired">Required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isRecurring: !!checked }))
                  }
                />
                <Label htmlFor="isRecurring">Recurring</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMutuallyExclusive"
                  checked={formData.isMutuallyExclusive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isMutuallyExclusive: !!checked,
                    }))
                  }
                />
                <Label htmlFor="isMutuallyExclusive">Mutually Exclusive</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                {editingItem ? "Update" : "Add"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
