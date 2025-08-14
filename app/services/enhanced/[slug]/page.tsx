"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Shield,
  Check,
  Plus,
  Calculator,
  Star,
  Clock,
  Users,
  Heart,
  ChevronDown,
  ChevronRight,
  Package,
  Settings,
  Zap,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Header from "@/components/header";

// Import the types from our new API
interface CustomerService {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice?: number;
  plans: CustomerPlan[];
  category: string;
  isPopular: boolean;
  metadata: {
    totalPlans: number;
    totalFeatures: number;
    totalAddons: number;
    startingPrice: number;
  };
}

interface CustomerPlan {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  isRequired: boolean;
  isRecurring: boolean;
  features: CustomerFeature[];
  sortOrder: number;
  pricing: {
    hourly?: number;
    daily?: number;
    monthly?: number;
  };
}

interface CustomerFeature {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  isRequired: boolean;
  isRecurring: boolean;
  addons: CustomerAddon[];
  sortOrder: number;
}

interface CustomerAddon {
  id: string;
  name: string;
  description?: string;
  price: number;
  isRequired: boolean;
  isRecurring: boolean;
  sortOrder: number;
}

export default function EnhancedServicePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [service, setService] = useState<CustomerService | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<CustomerPlan | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [pricingPeriod, setPricingPeriod] = useState<
    "hourly" | "daily" | "monthly"
  >("daily");

  useEffect(() => {
    loadService();
  }, [slug]);

  useEffect(() => {
    // Auto-select first plan and expand it
    if (service?.plans.length && !selectedPlan) {
      const firstPlan = service.plans[0];
      setSelectedPlan(firstPlan);
      setExpandedPlans(new Set([firstPlan.id]));
    }
  }, [service, selectedPlan]);

  const loadService = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/pricing/${slug}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setService(data.service);
        }
      }
    } catch (error) {
      console.error("Error loading service:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlanExpansion = (planId: string) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

  const toggleAddon = (addonId: string) => {
    const newSelected = new Set(selectedAddons);
    if (newSelected.has(addonId)) {
      newSelected.delete(addonId);
    } else {
      newSelected.add(addonId);
    }
    setSelectedAddons(newSelected);
  };

  const calculateTotalPrice = () => {
    if (!selectedPlan) return 0;

    let total = selectedPlan.pricing[pricingPeriod] || 0;

    // Add addon prices
    if (service) {
      for (const plan of service.plans) {
        for (const feature of plan.features) {
          for (const addon of feature.addons) {
            if (selectedAddons.has(addon.id)) {
              let addonPrice = addon.price;
              if (pricingPeriod === "monthly") {
                addonPrice *= 30;
              } else if (pricingPeriod === "hourly") {
                addonPrice /= 24;
              }
              total += addonPrice;
            }
          }
        }
      }
    }

    return total;
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes("basic")) return Package;
    if (planName.toLowerCase().includes("premium")) return Star;
    if (planName.toLowerCase().includes("essential")) return Shield;
    return Settings;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-slate-600">
              Loading service details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Service not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Service Overview */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-teal-100 rounded-xl">
                          {/* <Shield className="h-8 w-8 text-teal-600" /> */}
                        </div>
                        <div>
                          <h1 className="text-4xl font-bold text-slate-900">
                            {service.name}
                          </h1>
                          <Badge variant="outline" className="mt-2">
                            {service.category.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-lg text-slate-600 leading-relaxed">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-teal-600">
                        {service.metadata.totalPlans}
                      </div>
                      <div className="text-sm text-slate-600">
                        Service Plans
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {service.metadata.totalFeatures}
                      </div>
                      <div className="text-sm text-slate-600">
                        Core Features
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {service.metadata.totalAddons}
                      </div>
                      <div className="text-sm text-slate-600">
                        Available Add-ons
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Plans */}
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Package className="h-6 w-6 text-teal-600" />
                    Service Plans & Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {service.plans.map((plan) => {
                    const PlanIcon = getPlanIcon(plan.name);
                    const isExpanded = expandedPlans.has(plan.id);
                    const isSelected = selectedPlan?.id === plan.id;

                    return (
                      <div
                        key={plan.id}
                        className="border border-slate-200 rounded-lg overflow-hidden"
                      >
                        <Collapsible
                          open={isExpanded}
                          onOpenChange={() => togglePlanExpansion(plan.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <div
                              className={`p-6 cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-teal-50 border-teal-200"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`p-3 rounded-lg ${
                                      isSelected
                                        ? "bg-teal-100"
                                        : "bg-slate-100"
                                    }`}
                                  >
                                    <PlanIcon
                                      className={`h-6 w-6 ${
                                        isSelected
                                          ? "text-teal-600"
                                          : "text-slate-600"
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-semibold text-slate-900">
                                      {plan.name}
                                    </h3>
                                    {plan.description && (
                                      <p className="text-slate-600 mt-1">
                                        {plan.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {plan.features.length} Features
                                      </Badge>
                                      <span className="text-lg font-bold text-teal-600">
                                        {formatPrice(
                                          plan.pricing[pricingPeriod] || 0
                                        )}
                                        <span className="text-sm text-slate-500">
                                          /{pricingPeriod}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {!isSelected && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPlan(plan);
                                      }}
                                    >
                                      Select Plan
                                    </Button>
                                  )}
                                  {isSelected && (
                                    <Badge className="bg-teal-600">
                                      Selected
                                    </Badge>
                                  )}
                                  {isExpanded ? (
                                    <ChevronDown />
                                  ) : (
                                    <ChevronRight />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="px-6 pb-6 bg-slate-50/50">
                              <div className="space-y-4">
                                {plan.features.map((feature) => (
                                  <div
                                    key={feature.id}
                                    className="bg-white rounded-lg p-4 border border-slate-100"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                          <Check className="h-4 w-4 text-green-500" />
                                          {feature.name}
                                          {feature.isRequired && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              Required
                                            </Badge>
                                          )}
                                        </h4>
                                        {feature.description && (
                                          <p className="text-sm text-slate-600 mt-1">
                                            {feature.description}
                                          </p>
                                        )}
                                      </div>
                                      {feature.basePrice > 0 && (
                                        <span className="text-sm font-medium text-slate-900">
                                          +{formatPrice(feature.basePrice)}
                                        </span>
                                      )}
                                    </div>

                                    {/* Feature Add-ons */}
                                    {feature.addons.length > 0 && (
                                      <div className="pl-6 border-l-2 border-slate-200 ml-2 space-y-2">
                                        <div className="text-sm font-medium text-slate-700 mb-2">
                                          Available Add-ons:
                                        </div>
                                        {feature.addons.map((addon) => (
                                          <div
                                            key={addon.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-md"
                                          >
                                            <div className="flex items-center gap-3">
                                              <input
                                                type="checkbox"
                                                checked={selectedAddons.has(
                                                  addon.id
                                                )}
                                                onChange={() =>
                                                  toggleAddon(addon.id)
                                                }
                                                className="w-4 h-4 text-teal-600 rounded border-slate-300"
                                              />
                                              <div>
                                                <span className="text-sm font-medium text-slate-900">
                                                  {addon.name}
                                                </span>
                                                {addon.description && (
                                                  <p className="text-xs text-slate-600">
                                                    {addon.description}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            <span className="text-sm font-medium text-slate-900">
                                              +{formatPrice(addon.price)}/
                                              {pricingPeriod}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Pricing Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-6 border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-teal-600" />
                    Pricing Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pricing Period Selector */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-3 block">
                      Billing Period
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["hourly", "daily", "monthly"].map((period) => (
                        <Button
                          key={period}
                          variant={
                            pricingPeriod === period ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPricingPeriod(period as any)}
                          className={
                            pricingPeriod === period ? "bg-teal-600" : ""
                          }
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Selected Plan */}
                  {selectedPlan && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Selected Plan
                      </h4>
                      <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-teal-900">
                            {selectedPlan.name}
                          </span>
                          <span className="font-bold text-teal-600">
                            {formatPrice(
                              selectedPlan.pricing[pricingPeriod] || 0
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Add-ons */}
                  {selectedAddons.size > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Selected Add-ons
                      </h4>
                      <div className="space-y-2">
                        {service.plans.map((plan) =>
                          plan.features.map((feature) =>
                            feature.addons
                              .filter((addon) => selectedAddons.has(addon.id))
                              .map((addon) => (
                                <div
                                  key={addon.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-slate-700">
                                    {addon.name}
                                  </span>
                                  <span className="font-medium">
                                    +
                                    {formatPrice(
                                      pricingPeriod === "monthly"
                                        ? addon.price * 30
                                        : pricingPeriod === "hourly"
                                        ? addon.price / 24
                                        : addon.price
                                    )}
                                  </span>
                                </div>
                              ))
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Total Price */}
                  <div className="p-4 bg-slate-900 text-white rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300">Total Price</span>
                      <span className="text-2xl font-bold">
                        {formatPrice(calculateTotalPrice())}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">
                      Per {pricingPeriod} • All prices in GHS
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Book This Service
                    </Button>
                    <Button variant="outline" size="lg" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Speak to Consultant
                    </Button>
                  </div>

                  {/* Service Features */}
                  <div className="text-xs text-slate-600 space-y-1 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>24/7 support available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      <span>Professional care team</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      <span>Quick setup & deployment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
