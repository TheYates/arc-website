# Services & Pricing Management

This document explains how to use the new Services & Pricing Management system integrated into the ARC website.

## Overview

The pricing management system allows you to create and manage a hierarchical structure of services, plans, features, and sub-features with associated pricing information.

## Accessing the System

Navigate to `/services/pricing` to access the pricing management interface.

## Features

### TreeView Component

The system uses a custom TreeView component (`PricingTreeView`) that provides:

- **Hierarchical Display**: Shows services, plans, features, and sub-features in a tree structure
- **Interactive Controls**: Expand/collapse nodes, hover actions
- **Visual Indicators**: Color-coded badges for different item types
- **Action Buttons**: Add, Edit, Clone, and Delete functionality

### Item Types

The system supports four types of items:

1. **Service** (Blue badge) - Top-level services
2. **Plan** (Purple badge) - Service plans within a service
3. **Feature** (Orange badge) - Features within a plan
4. **Sub-Feature** (Green badge) - Sub-features within a feature

### Item Properties

Each item can have the following properties:

- **Name**: Display name of the item
- **Description**: Optional detailed description
- **Type**: One of the four item types above
- **Base Price**: Optional pricing information
- **Required**: Whether the item is required or optional
- **Recurring**: Whether the item has recurring charges
- **Mutually Exclusive**: Whether the item is mutually exclusive with others

## How to Use

### Adding Items

1. Click the "Add Service" button to add a top-level service
2. Hover over any existing item to see action buttons
3. Click the "+" button to add a child item (the system automatically suggests the appropriate child type)

### Editing Items

1. Hover over an item to reveal action buttons
2. Click the edit (pencil) icon
3. Modify the item properties in the dialog
4. Click "Update" to save changes

### Cloning Items

1. Hover over an item to reveal action buttons
2. Click the copy icon to create a duplicate
3. The cloned item will be added at the same level with "(Copy)" appended to the name

### Deleting Items

1. Hover over an item to reveal action buttons
2. Click the trash icon to delete the item
3. **Warning**: This will also delete all child items

### Sample Data

Use the "Load Sample Data" button to populate the system with example data showing:
- Home Care Service with AHENEFIE and ADAMFO PA plans
- Features like Emergency Response and Medication Management
- Sub-features like Ambulance Service

Use the "Clear All" button to remove all data and start fresh.

## Technical Details

### File Structure

- `app/services/pricing/page.tsx` - Main pricing management page
- `components/ui/pricing-tree-view.tsx` - TreeView component
- `lib/types/pricing.ts` - TypeScript type definitions

### Type Definitions

```typescript
interface PricingItem {
  id: string;
  name: string;
  description?: string;
  type: "service" | "plan" | "feature" | "subFeature";
  basePrice?: number;
  isRequired?: boolean;
  isRecurring?: boolean;
  isMutuallyExclusive?: boolean;
  children?: PricingItem[];
}
```

### Integration

The TreeView component is designed to integrate with your existing service customization system. The hierarchical structure can be mapped to your existing service categories and items.

## Future Enhancements

Potential improvements could include:

- Data persistence (save to database)
- Import/export functionality
- Bulk operations
- Advanced pricing rules
- Integration with the existing service customization component
- Validation rules for pricing structure

## Support

For questions or issues with the pricing management system, refer to the main project documentation or contact the development team.
