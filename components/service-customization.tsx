"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatOptionalPrice } from "@/lib/utils";
import { Check, Square, ArrowRight, Diamond } from "lucide-react";
import { TreeView, TreeNode } from "@/components/ui/tree-view";

interface Service {
  id: string;
  name: string;
  displayName: string;
  description: string;
  basePriceDaily: number;
  basePriceMonthly: number;
  basePriceHourly: number;
  priceDisplay: string;
  categories?: ServiceCategory[];
}

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
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
  children?: ServiceItem[];
}

interface ServiceCustomizationProps {
  serviceId: string;
  billingPeriod: "hourly" | "daily" | "monthly";
  onSelectionChange?: (selectedItems: string[], totalPrice: number) => void;
}

export function ServiceCustomization({
  serviceId,
  billingPeriod = "daily",
  onSelectionChange,
}: ServiceCustomizationProps) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionalItems, setSelectedOptionalItems] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    loadService();
  }, [serviceId]);

  useEffect(() => {
    // Notify parent component of selection changes
    if (onSelectionChange && service) {
      const totalPrice = calculateTotalPrice();
      onSelectionChange(Array.from(selectedOptionalItems), totalPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptionalItems, billingPeriod, service]);

  const loadService = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setService(data.service);
      }
    } catch (error) {
      console.error("Error loading service:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBasePrice = () => {
    if (!service) return 0;
    switch (billingPeriod) {
      case "hourly":
        return service.basePriceHourly;
      case "daily":
        return service.basePriceDaily;
      case "monthly":
        return service.basePriceMonthly;
      default:
        return service.basePriceDaily;
    }
  };

  const getItemPrice = (item: ServiceItem) => {
    switch (billingPeriod) {
      case "hourly":
        return item.priceHourly;
      case "daily":
        return item.priceDaily;
      case "monthly":
        return item.priceMonthly;
      default:
        return item.priceDaily;
    }
  };

  const calculateOptionalItemsPrice = () => {
    if (!service) return 0;

    let total = 0;
    service.categories?.forEach((category) => {
      const flatItems = flattenItems(category.items || []);
      flatItems.forEach((item) => {
        if (item.isOptional && selectedOptionalItems.has(item.id)) {
          total += getItemPrice(item);
        }
      });
    });

    return total;
  };

  const calculateTotalPrice = () => {
    return getBasePrice() + calculateOptionalItemsPrice();
  };

  const flattenItems = (items: ServiceItem[]): ServiceItem[] => {
    const result: ServiceItem[] = [];
    items.forEach((item) => {
      result.push(item);
      if (item.children) {
        result.push(...flattenItems(item.children));
      }
    });
    return result;
  };

  const getAllOptionalItems = () => {
    if (!service) return [];

    const optionalItems: ServiceItem[] = [];
    service.categories?.forEach((category) => {
      const flatItems = flattenItems(category.items || []);
      optionalItems.push(...flatItems.filter((item) => item.isOptional));
    });

    return optionalItems;
  };

  const handleOptionalItemToggle = (itemId: string) => {
    const newSelection = new Set(selectedOptionalItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedOptionalItems(newSelection);
  };

  const convertItemsToTreeNodes = (items: ServiceItem[]): TreeNode[] => {
    return items
      .filter((item) => item.isOptional) // Only show optional items in tree
      .map((item) => {
        const itemPrice = getItemPrice(item);
        const isSelected = selectedOptionalItems.has(item.id);

        return {
          id: item.id,
          label: (
            <div
              className="flex items-center justify-between w-full cursor-pointer"
              onClick={() => handleOptionalItemToggle(item.id)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleOptionalItemToggle(item.id);
                  }}
                />
                <div className="flex items-center gap-2">
                  {getLevelIcon(item.itemLevel)}
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.description && (
                  <span className="text-sm text-muted-foreground">
                    - {item.description}
                  </span>
                )}
              </div>
              <div className="text-right">
                {itemPrice > 0 ? (
                  <span className="font-semibold text-green-600">
                    {formatOptionalPrice(itemPrice)} {getBillingPeriodLabel()}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No additional charge
                  </span>
                )}
              </div>
            </div>
          ),
          children:
            item.children && item.children.length > 0
              ? convertItemsToTreeNodes(item.children)
              : undefined,
          isExpanded: true,
          className: isSelected
            ? "bg-blue-50 border border-blue-300 rounded-md"
            : "",
        };
      });
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Square className="h-4 w-4 text-gray-600" />;
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

  const getBillingPeriodLabel = () => {
    switch (billingPeriod) {
      case "hourly":
        return "per hour";
      case "daily":
        return "per day";
      case "monthly":
        return "per month";
      default:
        return "per day";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading service details...</div>
        </CardContent>
      </Card>
    );
  }

  if (!service) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Service not found</div>
        </CardContent>
      </Card>
    );
  }

  const optionalItems = getAllOptionalItems();
  const basePrice = getBasePrice();
  const optionalPrice = calculateOptionalItemsPrice();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="space-y-6">
      {/* Service Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{service.displayName}</span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {formatPrice(basePrice)} {getBillingPeriodLabel()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{service.description}</p>
        </CardContent>
      </Card>

      {/* Optional Items Selection */}
      {optionalItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Service</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select additional optional items to enhance your service package.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {service.categories?.map((category) => {
              const categoryOptionalItems = flattenItems(
                category.items || []
              ).filter((item) => item.isOptional);

              if (categoryOptionalItems.length === 0) return null;

              return (
                <div key={category.id} className="space-y-3">
                  <h4 className="font-semibold text-lg">{category.name}</h4>
                  <div className="border rounded-lg">
                    <TreeView
                      data={convertItemsToTreeNodes(category.items || [])}
                      onNodeSelect={(nodeId) => {
                        // Tree selection is handled by the checkbox in the label
                      }}
                      className="p-2"
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Price Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Price Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Base Service ({service.displayName})</span>
            <span>
              {formatPrice(basePrice)} {getBillingPeriodLabel()}
            </span>
          </div>

          {selectedOptionalItems.size > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="font-medium">Optional Items:</span>
                {Array.from(selectedOptionalItems).map((itemId) => {
                  const item = optionalItems.find((i) => i.id === itemId);
                  if (!item) return null;

                  const itemPrice = getItemPrice(item);
                  return (
                    <div
                      key={itemId}
                      className="flex justify-between text-sm ml-4"
                    >
                      <span>• {item.name}</span>
                      <span>
                        {itemPrice > 0
                          ? `${formatOptionalPrice(
                              itemPrice
                            )} ${getBillingPeriodLabel()}`
                          : "No charge"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Optional Items Subtotal</span>
                <span>
                  {formatPrice(optionalPrice)} {getBillingPeriodLabel()}
                </span>
              </div>
            </>
          )}

          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Price</span>
            <span className="text-green-600">
              {formatPrice(totalPrice)} {getBillingPeriodLabel()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
