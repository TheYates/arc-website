"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  Shield,
  Clock,
  Heart,
  Phone,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Testimonials from "@/components/testimonials";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HeroImage } from "@/components/ui/optimized-image";
import { IMAGES, ALT_TEXTS } from "@/lib/constants/images";

// Service structure types
interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  children?: ServiceItem[];
  level: number; // For indentation levels
  isOptional?: boolean; // For optional services
}

interface AhenefieService {
  id: string;
  name: string;
  description?: string;
  items: ServiceItem[];
}

// Utility function to format pricing
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export default function AhenefiePage() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [ahenefieService, setAhenefieService] =
    useState<AhenefieService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch AHENEFIE service data from admin
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/services/pricing?name=AHENEFIE");
        const result = await response.json();

        if (result.success && result.data) {
          setAhenefieService(result.data);
          console.log("Using dynamic data from admin");
          console.log("Service data:", result.data);

          // Debug pricing for optional items
          const flattenItems = (items: any[]): any[] => {
            let result: any[] = [];
            items.forEach((item: any) => {
              result.push(item);
              if (item.children) {
                result = result.concat(flattenItems(item.children));
              }
            });
            return result;
          };

          const allItems = flattenItems(result.data.items || []);
          const optionalItems = allItems.filter((item) => item.isOptional);
          console.log(
            "Optional items found:",
            optionalItems.map((item) => ({
              name: item.name,
              level: item.level,
            }))
          );
        } else {
          setError("No service data found");
          console.log("No dynamic data found");
        }
      } catch (err) {
        console.error("Error fetching service data:", err);
        setError("Failed to load service data");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, []);

  useEffect(() => {
    // Auto-expand items with children for better UX when service data is loaded
    if (ahenefieService) {
      const itemsToExpand = ahenefieService.items
        .filter((item) => item.children && item.children.length > 0)
        .slice(0, 2) // Expand first 2 items with children
        .map((item) => item.id);
      setExpandedItems(new Set(itemsToExpand));
    }
  }, [ahenefieService]);

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderServiceItem = (item: ServiceItem): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    // Only render top-level items as cards for the main style
    if (item.level === 1) {
      return (
        <Card
          key={item.id}
          className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {hasChildren ? (
            <Collapsible
              open={isExpanded}
              onOpenChange={() => toggleItemExpansion(item.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader
                  className="cursor-pointer hover:bg-slate-50 transition-colors duration-200 py-4 px-6"
                  role="button"
                  aria-expanded={isExpanded}
                  aria-controls={`service-content-${item.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-teal-700 flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          {item.name}
                        </CardTitle>
                        {item.isOptional && (
                          <Badge
                            variant="outline"
                            className="text-orange-600 border-orange-200 bg-orange-50"
                          >
                            Optional
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-slate-400 ml-4 flex-shrink-0 transition-transform" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400 ml-4 flex-shrink-0 transition-transform" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent id={`service-content-${item.id}`}>
                <CardContent className="pt-0 pb-4 px-6">
                  <div className="border-t border-slate-100 pt-4">
                    <div className="space-y-3">
                      {item.children?.map((child) => renderNestedItem(child))}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <CardHeader className="py-4 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-teal-700 flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  {item.name}
                </CardTitle>
                {item.isOptional && (
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-200 bg-orange-50"
                  >
                    Optional
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                  {item.description}
                </p>
              )}
            </CardHeader>
          )}
        </Card>
      );
    }

    return null; // Level 1 items are handled above
  };

  const renderNestedItem = (item: ServiceItem): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="border-l-4 border-teal-200 pl-4 py-2">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          {item.name}
        </h4>
        {item.description && (
          <p className="text-sm text-slate-600 mb-3 ml-6 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Nested children as "Includes" */}
        {hasChildren && (
          <div className="ml-6 space-y-2">
            <div className="text-sm font-medium text-slate-700 mb-2">
              Includes:
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {item.children?.map((child) => (
                <div
                  key={child.id}
                  className="flex items-start gap-3 text-sm py-1"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <span className="text-slate-700 font-medium">
                      {child.name}
                    </span>
                    {child.description && (
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                        {child.description}
                      </p>
                    )}
                    {/* Handle deeper nesting */}
                    {child.children && child.children.length > 0 && (
                      <div className="ml-4 mt-2 space-y-1">
                        {child.children.map((grandchild) => (
                          <div
                            key={grandchild.id}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <span className="text-slate-600 font-medium">
                                {grandchild.name}
                              </span>
                              {grandchild.description && (
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                                  {grandchild.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <HeroImage
            src={IMAGES.services.ahenefie.hero}
            alt={ALT_TEXTS.services.ahenefie.hero}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 to-cyan-900/10"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white font-ahenefie">
                  {ahenefieService?.name}
                </h1>
              </div>
              <Badge className="bg-white/20 text-white border border-white/30 mb-4">
                Home Care Service
              </Badge>
              <p className="text-2xl text-teal-100 mb-4">
                Live-in Home Care Package
              </p>
              <p className="text-xl font-medium text-white/90 leading-relaxed mb-8">
                {ahenefieService?.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="bg-teal-500 hover:bg-teal-600 text-white px-8"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-teal-900 px-8 bg-transparent"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Complete Live-in Care Solution
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                AHENEFIE provides the most comprehensive home care package
                available in Ghana. Our certified nurses live in your home,
                providing round-the-clock care, monitoring, and support for your
                family member.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Perfect for elderly family members, individuals recovering from
                surgery, or anyone requiring continuous medical supervision and
                personal care assistance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Clock className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    24/7 Care
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Round-the-clock professional nursing support
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Emergency Ready
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Immediate response to medical emergencies
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Heart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Compassionate
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Caring, respectful treatment like family
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Family Support
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Regular updates and family coordination
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Included */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              What's Included
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive care services included in your AHENEFIE package
            </p>
          </div>

          {/* Hierarchical service structure display */}
          <div className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-red-700 mb-4 text-base">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="default"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : ahenefieService ? (
              ahenefieService.items.map((item) => renderServiceItem(item))
            ) : (
              <div className="text-center py-12">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-slate-600 text-base">
                    No service details available.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="bg-teal-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start AHENEFIE Care?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Give your loved one the comprehensive care they deserve with our
            live-in nursing service.
          </p>
          <Link href="/get-started">
            <Button
              size="lg"
              className="bg-white text-teal-600 hover:bg-slate-100 px-8 py-3"
            >
              Book Free Consultation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
