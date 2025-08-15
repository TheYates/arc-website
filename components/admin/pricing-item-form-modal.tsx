"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PricingItem } from "@/lib/types/packages";

// Utility function to cleanup modal styles (no DOM manipulation)
const forceCleanupModal = () => {
  // Ensure body is interactive (let React handle DOM)
  document.body.style.overflow = "auto";
  document.body.style.pointerEvents = "auto";
  document.body.classList.remove("overflow-hidden");

  console.log("Force cleanup completed");
};

interface PricingItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<PricingItem>) => void;
  item?: PricingItem | null;
  parentId?: string | null;
  defaultType?: PricingItem["type"];
  mode: "create" | "edit";
}

export default function PricingItemFormModal({
  isOpen,
  onClose,
  onSave,
  item,
  parentId,
  defaultType = "service",
  mode,
}: PricingItemFormModalProps) {
  const [formData, setFormData] = useState<Partial<PricingItem>>({
    name: "",
    description: "",
    type: defaultType,
    basePrice: 0,
    isRequired: false, // Default to optional
    isRecurring: true, // Default to recurring
    isMutuallyExclusive: false,
    parentId: parentId || null,
    sortOrder: 0,
    colorTheme: "teal", // Default color theme for services
  });

  const [isOptional, setIsOptional] = useState(false);
  const [optionalPrice, setOptionalPrice] = useState(0);

  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item && mode === "edit") {
      const itemIsOptional =
        (item.type === "feature" || item.type === "addon") &&
        !item.isRequired &&
        (item.basePrice || 0) > 0;
      setFormData({
        id: item.id,
        name: item.name,
        description: item.description || "",
        type: item.type,
        basePrice: item.type === "service" ? item.basePrice || 0 : 0, // Only services have base price
        isRequired: item.isRequired,
        isRecurring: item.isRecurring || true,
        isMutuallyExclusive: item.isMutuallyExclusive || false,
        parentId: item.parentId,
        sortOrder: item.sortOrder || 0,
        colorTheme: item.colorTheme || "teal", // Load existing color theme or default to teal
      });
      setIsOptional(itemIsOptional);
      setOptionalPrice(itemIsOptional ? item.basePrice || 0 : 0);
    } else if (mode === "create") {
      setFormData({
        name: "",
        description: "",
        type: defaultType,
        basePrice: 0,
        isRequired: defaultType === "service",
        isRecurring: true,
        isMutuallyExclusive: false,
        parentId: parentId || null,
        sortOrder: 0,
        colorTheme: "teal", // Default color theme for new services
      });
      setIsOptional(false);
      setOptionalPrice(0);
    }
  }, [item, mode, defaultType, parentId]);

  // Cleanup effect when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure modal close animation completes
      const cleanup = setTimeout(() => {
        forceCleanupModal();
      }, 300);

      return () => clearTimeout(cleanup);
    }
  }, [isOpen]);

  // Focus the name input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      // Multiple attempts to ensure focus works reliably
      const focusAttempts = [100, 200, 300]; // Try at different intervals

      const timeouts = focusAttempts.map((delay) =>
        setTimeout(() => {
          if (nameInputRef.current && isOpen) {
            nameInputRef.current.focus();
            if (mode === "edit") {
              nameInputRef.current.select(); // Select all text if editing
            }
            console.log(`🎯 Focus attempt at ${delay}ms`);
          }
        }, delay)
      );

      return () => {
        timeouts.forEach((timeout) => clearTimeout(timeout));
      };
    }
  }, [isOpen, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      // Ignore pricing; keep layout but do not submit any price values
      const finalFormData = {
        ...formData,
        // Set isRequired based on optional status (for features/add-ons)
        isRequired:
          formData.type === "service"
            ? true // Services are always required
            : !isOptional, // Features/Add-ons depend on optional status
      };

      console.log("Modal: Submitting form data:", finalFormData);
      await onSave(finalFormData);
      console.log("Modal: Form submission successful");

      // Force close modal immediately
      console.log("Modal: Calling onClose()");
      onClose();

      // Additional safety: reset form state
      setFormData({
        name: "",
        description: "",
        type: defaultType,
        basePrice: 0,
        isRequired: false,
        isRecurring: true,
        isMutuallyExclusive: false,
        parentId: parentId || null,
        sortOrder: 0,
      });
      setIsOptional(false);
      setOptionalPrice(0);
    } catch (error) {
      console.error("Modal: Error saving pricing item:", error);
      // Don't close modal on error so user can retry
    } finally {
      setLoading(false);
      console.log("Modal: Loading state set to false");
    }
  };

  const handleInputChange = (field: keyof PricingItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getTypeLabel = (type: PricingItem["type"]) => {
    switch (type) {
      case "service":
        return "Service";
      case "feature":
        return "Feature";
      case "addon":
        return "Add-on";
      default:
        return type;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        console.log("Dialog onOpenChange called with:", open);
        if (!open) {
          console.log("Dialog requesting close");
          // Force immediate cleanup
          setTimeout(() => {
            forceCleanupModal();
          }, 100);
          onClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[500px]"
        onOpenAutoFocus={(e) => {
          // Prevent default auto-focus, we'll handle it manually for better control
          e.preventDefault();
          console.log("🎯 Dialog opened, preventing default focus");

          // Immediate focus attempt
          setTimeout(() => {
            if (nameInputRef.current) {
              nameInputRef.current.focus();
              console.log("🎯 Immediate focus attempt");
            }
          }, 0);
        }}
        onEscapeKeyDown={(e) => {
          console.log("Dialog escape key pressed");
          e.preventDefault();
          setTimeout(() => {
            forceCleanupModal();
          }, 100);
          onClose();
        }}
        onPointerDownOutside={(e) => {
          console.log("Dialog clicked outside");
          e.preventDefault();
          setTimeout(() => {
            forceCleanupModal();
          }, 100);
          onClose();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Item" : "Edit Item"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new pricing item in the service hierarchy."
              : "Update the pricing item details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              ref={nameInputRef}
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter item description"
              rows={3}
            />
          </div>

          {/* Base Price - For Services Only */}
          {formData.type === "service" && (
            <div className="space-y-2">
              {/* Base price section hidden to remove pricing without affecting layout */}
            </div>
          )}

          {/* Color Theme - For Services Only */}
          {formData.type === "service" && (
            <div className="space-y-2">
              <Label htmlFor="colorTheme">Color Theme</Label>
              <Select
                value={formData.colorTheme || "teal"}
                onValueChange={(value) =>
                  handleInputChange("colorTheme", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teal">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                      Teal
                    </div>
                  </SelectItem>
                  <SelectItem value="blue">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Blue
                    </div>
                  </SelectItem>
                  <SelectItem value="purple">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      Purple
                    </div>
                  </SelectItem>
                  <SelectItem value="indigo">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      Indigo
                    </div>
                  </SelectItem>
                  <SelectItem value="green">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Green
                    </div>
                  </SelectItem>
                  <SelectItem value="red">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Red
                    </div>
                  </SelectItem>
                  <SelectItem value="orange">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      Orange
                    </div>
                  </SelectItem>
                  <SelectItem value="amber">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      Amber
                    </div>
                  </SelectItem>
                  <SelectItem value="yellow">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Yellow
                    </div>
                  </SelectItem>
                  <SelectItem value="lime">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                      Lime
                    </div>
                  </SelectItem>
                  <SelectItem value="emerald">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      Emerald
                    </div>
                  </SelectItem>
                  <SelectItem value="cyan">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      Cyan
                    </div>
                  </SelectItem>
                  <SelectItem value="sky">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                      Sky
                    </div>
                  </SelectItem>
                  <SelectItem value="violet">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                      Violet
                    </div>
                  </SelectItem>
                  <SelectItem value="fuchsia">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-fuchsia-500"></div>
                      Fuchsia
                    </div>
                  </SelectItem>
                  <SelectItem value="pink">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      Pink
                    </div>
                  </SelectItem>
                  <SelectItem value="rose">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      Rose
                    </div>
                  </SelectItem>
                  <SelectItem value="slate">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                      Slate
                    </div>
                  </SelectItem>
                  <SelectItem value="gray">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      Gray
                    </div>
                  </SelectItem>
                  <SelectItem value="zinc">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-zinc-500"></div>
                      Zinc
                    </div>
                  </SelectItem>
                  <SelectItem value="neutral">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-neutral-500"></div>
                      Neutral
                    </div>
                  </SelectItem>
                  <SelectItem value="stone">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-stone-500"></div>
                      Stone
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-600">
                Choose a color theme for this service card
              </p>
            </div>
          )}

          {/* Optional Switch - Only for Features and Add-ons */}
          {(formData.type === "feature" || formData.type === "addon") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isOptional">Optional Item</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this item optional with additional pricing
                  </p>
                </div>
                <Switch
                  id="isOptional"
                  checked={isOptional}
                  onCheckedChange={setIsOptional}
                />
              </div>

              {/* Optional Price - Only shown when optional is enabled */}
              {isOptional && (
                <div className="space-y-2">
                  {/* Optional price input hidden to remove pricing without affecting layout */}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name?.trim()}>
              {loading
                ? "Saving..."
                : mode === "create"
                ? "Create Item"
                : "Update Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
