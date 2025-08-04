"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PricingItem } from "@/lib/types/pricing"

interface TreeViewProps {
  items: PricingItem[]
  onAdd: (parentId: string | null, type: PricingItem["type"]) => void
  onEdit: (item: PricingItem) => void
  onDelete: (id: string) => void
  onClone: (item: PricingItem) => void
}

interface TreeNodeProps {
  item: PricingItem
  level: number
  onAdd: (parentId: string | null, type: PricingItem["type"]) => void
  onEdit: (item: PricingItem) => void
  onDelete: (id: string) => void
  onClone: (item: PricingItem) => void
}

const TreeNode = ({ item, level, onAdd, onEdit, onDelete, onClone }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const getTypeColor = (type: PricingItem["type"]) => {
    switch (type) {
      case "service":
        return "bg-blue-100 text-blue-800"
      case "plan":
        return "bg-purple-100 text-purple-800"
      case "feature":
        return "bg-orange-100 text-orange-800"
      case "subFeature":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNextChildType = (currentType: PricingItem["type"]): PricingItem["type"] => {
    switch (currentType) {
      case "service":
        return "plan"
      case "plan":
        return "feature"
      case "feature":
        return "subFeature"
      case "subFeature":
        return "subFeature"
      default:
        return "subFeature"
    }
  }

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md group`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!item.children || item.children.length === 0}
        >
          {item.children && item.children.length > 0 ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : null}
        </Button>

        <Badge variant="secondary" className={getTypeColor(item.type)}>
          {item.type}
        </Badge>

        <span className="font-medium">{item.name}</span>

        {item.basePrice !== undefined && <Badge variant="outline">${item.basePrice.toFixed(2)}</Badge>}

        {item.isRequired && <Badge variant="destructive">Required</Badge>}
        {!item.isRequired && <Badge variant="secondary">Optional</Badge>}
        {item.isRecurring && <Badge variant="secondary">Recurring</Badge>}
        {item.isMutuallyExclusive && <Badge variant="secondary">Exclusive</Badge>}

        <div className={`ml-auto flex gap-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onAdd(item.id, getNextChildType(item.type))}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(item)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onClone(item)}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isExpanded && item.children && item.children.length > 0 && (
        <div>
          {item.children.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              level={level + 1}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onClone={onClone}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const PricingTreeView = ({ items = [], onAdd, onEdit, onDelete, onClone }: TreeViewProps) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Services & Pricing</h3>
        <Button onClick={() => onAdd(null, "service")} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="space-y-1">
        {items.length > 0 ? (
          items.map((item) => (
            <TreeNode
              key={item.id}
              item={item}
              level={0}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onClone={onClone}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No services yet. Click "Add Service" to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
