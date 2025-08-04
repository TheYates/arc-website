"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

// Service structure types
interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  children?: ServiceItem[];
  level: number; // For indentation levels
  isOptional?: boolean; // For optional services
  basePrice?: number; // For pricing information
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
  const [ahenefieService, setAhenefieService] = useState<AhenefieService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Fetch AHENEFIE service data from admin
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/services/pricing?name=AHENEFIE');
        const result = await response.json();

        if (result.success && result.data) {
          setAhenefieService(result.data);
          console.log('Using dynamic data from admin');
        } else {
          setError('No service data found');
          console.log('No dynamic data found');
        }
      } catch (err) {
        console.error('Error fetching service data:', err);
        setError('Failed to load service data');
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
        <Card key={item.id} className="overflow-hidden">
          {hasChildren ? (
            <Collapsible
              open={isExpanded}
              onOpenChange={() => toggleItemExpansion(item.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-teal-600 flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          {item.name}
                        </CardTitle>
                        {item.isOptional && (
                          <span className="text-orange-600 text-xs">
                            Optional
                            {item.basePrice && item.basePrice > 0 && (
                              <span className="ml-1 text-green-600">+ {formatPrice(item.basePrice)}</span>
                            )}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-slate-600 mt-1 text-sm leading-tight">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-500 ml-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500 ml-2" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 pb-2 px-4">
                  <div className="space-y-1">
                    {item.children?.map((child) => renderNestedItem(child))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-teal-600 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {item.name}
                </CardTitle>
                {item.isOptional && (
                  <span className="text-orange-600 text-xs font-medium">
                    Optional
                    {item.basePrice && item.basePrice > 0 && (
                      <span className="ml-1 text-green-600">+ {formatPrice(item.basePrice)}</span>
                    )}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-slate-600 mt-1 text-sm leading-tight">{item.description}</p>
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
      <div key={item.id} className="border-l-4 border-teal-200 pl-3">
        <h4 className="font-medium text-slate-900 flex items-center gap-2 mb-1">
          <Check className="h-3 w-3 text-green-500" />
          {item.name}
        </h4>
        {item.description && (
          <p className="text-xs text-slate-600 mb-2 ml-5">{item.description}</p>
        )}

        {/* Nested children as "Includes" */}
        {hasChildren && (
          <div className="ml-5 space-y-1">
            <div className="text-xs font-light text-slate-700">
              Includes:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {item.children?.map((child) => (
                <div
                  key={child.id}
                  className="flex items-start gap-2 text-xs py-0.5"
                >
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <span className="text-slate-700 font-medium">
                      {child.name}
                    </span>
                    {child.description && (
                      <p className="text-slate-500 text-xs mt-0.5">
                        {child.description}
                      </p>
                    )}
                    {/* Handle deeper nesting */}
                    {child.children && child.children.length > 0 && (
                      <div className="ml-3 mt-0.5 space-y-0.5">
                        {child.children.map((grandchild) => (
                          <div
                            key={grandchild.id}
                            className="flex items-start gap-1 text-xs"
                          >
                            <div className="w-1 h-1 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                            <div>
                              <span className="text-slate-600 font-medium">
                                {grandchild.name}
                              </span>
                              {grandchild.description && (
                                <p className="text-slate-400 text-xs mt-0.5">
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
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg"
            alt="Professional home healthcare nurse caring for elderly patient"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 to-blue-900/50"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <Shield className="h-12 w-12 text-teal-300" />
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  {ahenefieService?.name.toUpperCase()}
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
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              What's Included
            </h2>
            <p className="text-lg text-slate-600">
              Comprehensive care services included in your AHENEFIE package
            </p>

          </div>

          {/* Hierarchical service structure display */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-slate-600 mt-3 text-sm">Loading service details...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <p className="text-red-600 mb-3 text-sm">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="border-teal-600 text-teal-600"
                >
                  Retry
                </Button>
              </div>
            ) : ahenefieService ? (
              ahenefieService.items.map((item) => renderServiceItem(item))
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-600 text-sm">No service details available.</p>
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
