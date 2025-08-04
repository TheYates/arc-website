"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PricingItem } from "@/lib/types/packages"

// Utility function to force cleanup modal artifacts
const forceCleanupModal = () => {
  // Remove any lingering modal overlays
  const overlays = document.querySelectorAll('[data-radix-popper-content-wrapper], [data-radix-dialog-overlay], [data-state="open"]');
  overlays.forEach(overlay => {
    if (overlay.getAttribute('role') === 'dialog' || overlay.classList.contains('fixed')) {
      overlay.remove();
    }
  });

  // Ensure body is interactive
  document.body.style.overflow = 'auto';
  document.body.style.pointerEvents = 'auto';
  document.body.classList.remove('overflow-hidden');

  console.log("Force cleanup completed");
};

interface PricingItemFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: Partial<PricingItem>) => void
  item?: PricingItem | null
  parentId?: string | null
  defaultType?: PricingItem["type"]
  mode: "create" | "edit"
}

export default function PricingItemFormModal({
  isOpen,
  onClose,
  onSave,
  item,
  parentId,
  defaultType = "service",
  mode
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
    sortOrder: 0
  })

  const [isOptional, setIsOptional] = useState(false)
  const [optionalPrice, setOptionalPrice] = useState(0)

  const [loading, setLoading] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (item && mode === "edit") {
      const itemIsOptional = (item.type === "feature" || item.type === "addon") && !item.isRequired && (item.basePrice || 0) > 0
      setFormData({
        id: item.id,
        name: item.name,
        description: item.description || "",
        type: item.type,
        basePrice: item.type === "service" ? (item.basePrice || 0) : 0, // Only services have base price
        isRequired: item.isRequired,
        isRecurring: item.isRecurring || true,
        isMutuallyExclusive: item.isMutuallyExclusive || false,
        parentId: item.parentId,
        sortOrder: item.sortOrder || 0
      })
      setIsOptional(itemIsOptional)
      setOptionalPrice(itemIsOptional ? (item.basePrice || 0) : 0)
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
        sortOrder: 0
      })
      setIsOptional(false)
      setOptionalPrice(0)
    }
  }, [item, mode, defaultType, parentId])

  // Cleanup effect when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure modal close animation completes
      const cleanup = setTimeout(() => {
        forceCleanupModal();
      }, 300);

      return () => clearTimeout(cleanup);
    }
  }, [isOpen])

  // Focus the name input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      // Small delay to ensure modal is fully rendered
      const focusTimeout = setTimeout(() => {
        nameInputRef.current?.focus()
        nameInputRef.current?.select() // Select all text if editing
      }, 100)

      return () => clearTimeout(focusTimeout)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)

    try {
      // Validation: Services must have a base price > 0
      if (formData.type === "service" && (!formData.basePrice || formData.basePrice <= 0)) {
        alert("Services must have a base price greater than 0");
        setLoading(false);
        return;
      }

      const finalFormData = {
        ...formData,
        // Set basePrice based on item type
        basePrice: formData.type === "service"
          ? formData.basePrice  // Services have base price
          : (isOptional ? optionalPrice : 0),  // Features/Add-ons use optional pricing
        // Set isRequired based on optional status (for features/add-ons)
        isRequired: formData.type === "service"
          ? true  // Services are always required
          : !isOptional  // Features/Add-ons depend on optional status
      }

      console.log("Modal: Submitting form data:", finalFormData)
      await onSave(finalFormData)
      console.log("Modal: Form submission successful")

      // Force close modal immediately
      console.log("Modal: Calling onClose()")
      onClose()

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
        sortOrder: 0
      })
      setIsOptional(false)
      setOptionalPrice(0)

    } catch (error) {
      console.error("Modal: Error saving pricing item:", error)
      // Don't close modal on error so user can retry
    } finally {
      setLoading(false)
      console.log("Modal: Loading state set to false")
    }
  }

  const handleInputChange = (field: keyof PricingItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getTypeLabel = (type: PricingItem["type"]) => {
    switch (type) {
      case "service":
        return "Service"
      case "feature":
        return "Feature"
      case "addon":
        return "Add-on"
      default:
        return type
    }
  }

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
          // Prevent default auto-focus, we'll handle it manually
          e.preventDefault();
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
              : "Update the pricing item details."
            }
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
              autoFocus
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
              <Label htmlFor="basePrice">
                Base Price (GHS) *
                {formData.type === "service" && (
                  <span className="text-xs text-slate-500 ml-1">
                    (Starting price for this service)
                  </span>
                )}
              </Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.basePrice || 0}
                onChange={(e) => handleInputChange("basePrice", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
              {formData.type === "service" && (
                <p className="text-xs text-slate-600">
                  This is the base price customers will pay for this service. Optional features and add-ons will be added to this base price.
                </p>
              )}
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
                  <Label htmlFor="optionalPrice">Additional Price (GHS) *</Label>
                  <Input
                    id="optionalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={optionalPrice}
                    onChange={(e) => setOptionalPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>
              )}
            </div>
          )}



          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name?.trim()}>
              {loading ? "Saving..." : mode === "create" ? "Create Item" : "Update Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
