"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Copy, Expand, Minimize2, GripVertical, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import {
  CSS,
} from '@dnd-kit/utilities'
import type { PricingItem } from "@/lib/types/packages"

interface TreeViewProps {
  items: PricingItem[]
  onAdd: (parentId: string | null, type: PricingItem["type"]) => void
  onEdit: (item: PricingItem) => void
  onDelete: (id: string) => void
  onClone: (item: PricingItem) => void
  onToggleComingSoon?: (item: PricingItem) => void
  onReorder?: (items: PricingItem[]) => void
}

interface TreeNodeProps {
  item: PricingItem
  level: number
  onAdd: (parentId: string | null, type: PricingItem["type"]) => void
  onEdit: (item: PricingItem) => void
  onDelete: (id: string) => void
  onClone: (item: PricingItem) => void
  onToggleComingSoon?: (item: PricingItem) => void
  expandedNodes: Set<string>
  onToggleExpanded: (nodeId: string) => void
  isDragging?: boolean
}

interface SortableTreeNodeProps extends TreeNodeProps {
  id: string
}

const SortableTreeNode = ({ item, level, onAdd, onEdit, onDelete, onClone, onToggleComingSoon, expandedNodes, onToggleExpanded, id }: SortableTreeNodeProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TreeNode
        item={item}
        level={level}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onClone={onClone}
        onToggleComingSoon={onToggleComingSoon}
        expandedNodes={expandedNodes}
        onToggleExpanded={onToggleExpanded}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

const TreeNode = ({ item, level, onAdd, onEdit, onDelete, onClone, onToggleComingSoon, expandedNodes, onToggleExpanded, isDragging, dragHandleProps }: TreeNodeProps & { dragHandleProps?: any }) => {
  const [isHovered, setIsHovered] = useState(false)
  const isExpanded = expandedNodes.has(item.id)

  const getTypeColor = (type: PricingItem["type"]) => {
    switch (type) {
      case "service":
        return "bg-blue-100 text-blue-800"
      case "plan":
        return "bg-purple-100 text-purple-800"
      case "feature":
        return "bg-orange-100 text-orange-800"
      case "addon":
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
        return "addon"
      case "addon":
        return "addon"
      default:
        return "addon"
    }
  }

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md group ${isDragging ? 'opacity-50' : ''}`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Drag Handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onToggleExpanded(item.id)}
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

        {/* Only show price badge for plans with base price or optional features/add-ons */}
        {((item.type === "plan" && (item.basePrice || 0) > 0) ||
          ((item.type === "feature" || item.type === "addon") && !item.isRequired && (item.basePrice || 0) > 0)) && (
          <Badge variant="outline">${(item.basePrice || 0).toFixed(2)}</Badge>
        )}

        {/* Only show optional badge for features/add-ons that are optional */}
        {(item.type === "feature" || item.type === "addon") && !item.isRequired && (
          <Badge variant="secondary">Optional</Badge>
        )}

        {/* Coming Soon badge for services */}
        {item.type === "service" && item.comingSoon && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        )}

        <div className={`ml-auto flex gap-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}>
          {/* Coming Soon toggle button for services */}
          {item.type === "service" && onToggleComingSoon && (
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 ${item.comingSoon ? 'text-amber-600 hover:text-amber-700' : 'text-gray-400 hover:text-amber-600'}`}
              onClick={() => onToggleComingSoon(item)}
              title={item.comingSoon ? "Mark as available" : "Mark as coming soon"}
            >
              <Clock className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onAdd(item.id, getNextChildType(item.type))}
            title="Add child item"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => onEdit(item)}
            title="Edit item"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => onClone(item)}
            title="Clone item"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => onDelete(item.id)}
            title="Delete item"
          >
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
              onToggleComingSoon={onToggleComingSoon}
              expandedNodes={expandedNodes}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const PricingTreeView = ({ items = [], onAdd, onEdit, onDelete, onClone, onToggleComingSoon, onReorder }: TreeViewProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Initialize all nodes as expanded
  useEffect(() => {
    const allNodeIds = new Set<string>()
    const collectNodeIds = (items: PricingItem[]) => {
      items.forEach(item => {
        allNodeIds.add(item.id)
        if (item.children) {
          collectNodeIds(item.children)
        }
      })
    }
    collectNodeIds(items)
    setExpandedNodes(allNodeIds)
  }, []) 

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && onReorder) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex)
        onReorder(newItems)
      }
    }
  }

  const handleToggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const handleExpandAll = () => {
    const allNodeIds = new Set<string>()
    const collectNodeIds = (items: PricingItem[]) => {
      items.forEach(item => {
        allNodeIds.add(item.id)
        if (item.children) {
          collectNodeIds(item.children)
        }
      })
    }
    collectNodeIds(items)
    setExpandedNodes(allNodeIds)
  }

  const handleCollapseAll = () => {
    setExpandedNodes(new Set())
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Tree View</h3>
        <div className="flex items-center gap-2">
          <Button onClick={handleExpandAll} size="sm" variant="outline">
            <Expand className="h-4 w-4 mr-2" />
            Expand All
          </Button>
          <Button onClick={handleCollapseAll} size="sm" variant="outline">
            <Minimize2 className="h-4 w-4 mr-2" />
            Collapse All
          </Button>
          <Button onClick={() => onAdd(null, "service")} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {items.length > 0 ? (
              items.map((item) => (
                <SortableTreeNode
                  key={item.id}
                  id={item.id}
                  item={item}
                  level={0}
                  onAdd={onAdd}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClone={onClone}
                  onToggleComingSoon={onToggleComingSoon}
                  expandedNodes={expandedNodes}
                  onToggleExpanded={handleToggleExpanded}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No services yet. Click "Add Service" to get started.</p>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
