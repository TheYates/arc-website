"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";

export interface TreeNode {
  id: string;
  label: React.ReactNode;
  children?: TreeNode[];
  isExpanded?: boolean;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

interface TreeViewProps {
  data: TreeNode[];
  onNodeToggle?: (nodeId: string, isExpanded: boolean) => void;
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId?: string;
  className?: string;
}

interface TreeNodeProps {
  node: TreeNode;
  level: number;
  onToggle?: (nodeId: string, isExpanded: boolean) => void;
  onSelect?: (nodeId: string) => void;
  selectedNodeId?: string;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node,
  level,
  onToggle,
  onSelect,
  selectedNodeId,
}) => {
  const [isExpanded, setIsExpanded] = useState(node.isExpanded ?? true);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(node.id, newExpanded);
  };

  const handleSelect = () => {
    onSelect?.(node.id);
  };

  const indentWidth = level * 20;

  return (
    <div className="select-none">
      {/* Node Content */}
      <div
        className={cn(
          "flex items-center py-2 px-2 hover:bg-gray-50 rounded-md cursor-pointer group",
          selectedNodeId === node.id && "bg-blue-50 border border-blue-200",
          node.className
        )}
        style={{ paddingLeft: `${indentWidth + 8}px` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Button */}
        <div className="flex items-center justify-center w-6 h-6 mr-2">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-5 h-5" />
          )}
        </div>

        {/* Node Icon */}
        {node.icon && (
          <div className="flex items-center justify-center mr-2">
            {node.icon}
          </div>
        )}

        {/* Node Label */}
        <div className="flex-1 min-w-0">
          {node.label}
        </div>

        {/* Node Actions */}
        {node.actions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.actions}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-0">
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({
  data,
  onNodeToggle,
  onNodeSelect,
  selectedNodeId,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      {data.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          onToggle={onNodeToggle}
          onSelect={onNodeSelect}
          selectedNodeId={selectedNodeId}
        />
      ))}
    </div>
  );
};
