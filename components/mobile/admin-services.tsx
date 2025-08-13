"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Package,
  Plus,
  Search,
  TrendingUp,
  Users,
  DollarSign,
  Edit,
  Eye,
  Star,
  Clock,
  AlertCircle,
  Settings,
  MoreVertical,
  Palette,
} from "lucide-react";
import type { PricingItem } from "@/lib/types/packages";

interface AdminServicesMobileProps {
  onCreateService?: () => void;
  onEditService?: (service: PricingItem) => void;
}

export function AdminServicesMobile({
  onCreateService,
  onEditService,
}: AdminServicesMobileProps) {
  const router = useRouter();
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/pricing");
        const result = await response.json();
        setItems(result.success ? result.data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const services = items.filter((item) => item.type === "service");
  const features = items.filter((item) => item.type === "feature");
  const addons = items.filter((item) => item.type === "addon");

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "services" && item.type === "service") ||
      (activeTab === "features" && item.type === "feature") ||
      (activeTab === "addons" && item.type === "addon");
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (item: PricingItem) => {
    if (item.type === "service") {
      // For services, we'll use a default active status since isActive isn't in PricingItem
      return "bg-green-100 text-green-800";
    }
    return item.isRequired
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  const getStatusText = (item: PricingItem) => {
    if (item.type === "service") {
      // For services, we'll show "Active" by default since isActive isn't in PricingItem
      return "Active";
    }
    return item.isRequired ? "Required" : "Optional";
  };

  const getColorThemeIcon = (colorTheme?: string) => {
    const colors = {
      teal: "bg-teal-500",
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      green: "bg-green-500",
      orange: "bg-orange-500",
      pink: "bg-pink-500",
    };
    return colors[colorTheme as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services & Pricing</h1>
          <p className="text-sm text-muted-foreground">
            Manage your services catalog with real-time updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" className="h-8 w-8" onClick={onCreateService}>
            <Plus className="h-4 w-4" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="p-4">
              <SheetHeader>
                <SheetTitle>Service Management</SheetTitle>
                <SheetDescription>
                  Advanced settings and bulk operations
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Bulk Edit Services
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Pricing Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Import/Export
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">{services.length}</div>
                <div className="text-xs text-muted-foreground">Services</div>
              </div>
              <Package className="h-5 w-5 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">{features.length}</div>
                <div className="text-xs text-muted-foreground">Features</div>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">{addons.length}</div>
                <div className="text-xs text-muted-foreground">Add-ons</div>
              </div>
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">{items.length}</div>
                <div className="text-xs text-muted-foreground">Total Items</div>
              </div>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs">
              Services
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs">
              Features
            </TabsTrigger>
            <TabsTrigger value="addons" className="text-xs">
              Add-ons
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-3">
            {loading ? (
              <div className="py-8 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
                  <span className="text-sm text-muted-foreground">
                    Loading services...
                  </span>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <div className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No services match your search"
                    : "No services found"}
                </div>
                {!searchQuery && (
                  <Button size="sm" className="mt-3" onClick={onCreateService}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create First Service
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="active:scale-[0.99] transition-all duration-200 border-l-4"
                    style={{
                      borderLeftColor:
                        item.type === "service"
                          ? "#14b8a6"
                          : item.type === "feature"
                          ? "#3b82f6"
                          : "#8b5cf6",
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium text-sm truncate">
                              {item.name}
                            </div>
                            {item.type === "service" && (
                              <div
                                className={`w-2 h-2 rounded-full ${getColorThemeIcon(
                                  item.colorTheme
                                )}`}
                              />
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {item.type}
                            </Badge>
                            <Badge
                              className={`text-xs ${getStatusColor(item)}`}
                            >
                              {getStatusText(item)}
                            </Badge>
                            {item.type === "service" &&
                              item.sortOrder === 0 && (
                                <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                          </div>

                          {item.description && (
                            <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {item.description}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center invisible">
                                <DollarSign className="h-3 w-3 mr-1" />0
                              </span>
                              {item.children && item.children.length > 0 && (
                                <span className="flex items-center">
                                  <Package className="h-3 w-3 mr-1" />
                                  {item.children.length} items
                                </span>
                              )}
                              {item.sortOrder !== undefined && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />#
                                  {item.sortOrder}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() =>
                              router.push(`/admin/services/${item.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => onEditService?.(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="p-4">
                              <SheetHeader>
                                <SheetTitle>{item.name}</SheetTitle>
                                <SheetDescription>
                                  {item.type} • {getStatusText(item)}
                                </SheetDescription>
                              </SheetHeader>
                              <div className="py-4 space-y-2">
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit {item.type}
                                </Button>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                {item.type === "service" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Feature
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start"
                                    >
                                      <Palette className="h-4 w-4 mr-2" />
                                      Change Theme
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-red-600"
                                >
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  Delete {item.type}
                                </Button>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Quick Actions</div>
              <div className="text-xs text-muted-foreground">
                Manage your services efficiently
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={onCreateService}>
                <Plus className="h-4 w-4 mr-1" />
                New Service
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
