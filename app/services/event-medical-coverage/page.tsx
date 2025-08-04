"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Check, Calendar, Shield, Phone, Car, Heart, Users, Clock, AlertTriangle, ChevronDown } from "lucide-react";
import Link from "next/link";
import Testimonials from "@/components/testimonials";
import { useState, useEffect } from "react";

// Utility function to format price
const formatPrice = (price: number): string => {
  return `GHS ${price.toFixed(2)}`;
};

// Service structure types
interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  level: number;
  children?: ServiceItem[];
  basePrice?: number;
  isOptional?: boolean;
  isRecurring?: boolean;
}

interface EventMedicalCoverageService {
  id: string;
  name: string;
  description: string;
  basePrice?: number;
  items: ServiceItem[];
}

export default function EventMedicalCoveragePage() {
  const [eventMedicalService, setEventMedicalService] = useState<EventMedicalCoverageService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fetch Event Medical Coverage service data from admin
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const response = await fetch('/api/services/event-medical-coverage');
        const result = await response.json();

        if (result.success && result.data) {
          setEventMedicalService(result.data);
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

  // Auto-expand items with children for better UX when service data is loaded
  useEffect(() => {
    if (eventMedicalService) {
      const itemsToExpand = eventMedicalService.items
        .filter((item) => item.children && item.children.length > 0)
        .slice(0, 2) // Expand first 2 items with children
        .map((item) => item.id);
      setExpandedItems(new Set(itemsToExpand));
    }
  }, [eventMedicalService]);

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
                        <CardTitle className="text-base text-red-600 flex items-center gap-2">
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
                        <CardDescription className="text-xs text-slate-600 mt-1">
                          {item.description}
                        </CardDescription>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 data-[state=open]:rotate-180" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 px-4 pb-4">
                  <div className="space-y-2">
                    {item.children?.map((child) => renderServiceItem(child))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-red-600 flex items-center gap-2">
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
                    <CardDescription className="text-xs text-slate-600 mt-1">
                      {item.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
          )}
        </Card>
      );
    }

    // Render nested items (level > 1) as simple list items
    return (
      <div key={item.id} className="flex items-start gap-2 py-1">
        <Check className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">{item.name}</span>
            {item.isOptional && item.basePrice && item.basePrice > 0 && (
              <span className="text-orange-600 text-xs ml-2">
                Optional +{formatPrice(item.basePrice)}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
          )}
          {item.children && item.children.length > 0 && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => renderServiceItem(child))}
            </div>
          )}
        </div>
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
            src="https://images.pexels.com/photos/69096/pexels-photo-69096.jpeg"
            alt="Professional event medical coverage and emergency response"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 to-orange-900/70"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <AlertTriangle className="h-12 w-12 text-red-300 flex-shrink-0" />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {eventMedicalService?.name?.toUpperCase() || "EVENT MEDICAL COVERAGE"}
                </h1>
              </div>
              <Badge className="bg-white/20 text-white border border-white/30 mb-4">Day Option</Badge>
              <p className="text-2xl text-red-100 mb-4">Professional Event Medical Services</p>
              <p className="text-xl font-medium text-white/90 leading-relaxed mb-8">
                {eventMedicalService?.description}
              </p>
              {eventMedicalService?.basePrice && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                    <span className="text-white font-semibold">Starting from {formatPrice(eventMedicalService.basePrice || 0)}</span>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="bg-red-500 hover:bg-red-600 text-white px-8"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-red-900 px-8 bg-transparent"
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
                Professional Event Medical Support
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Our Event Medical Coverage provides comprehensive medical support for events of all sizes. 
                From small gatherings to large festivals, our trained medical professionals ensure participant 
                safety with immediate response capabilities and emergency transport services.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Perfect for sporting events, concerts, festivals, corporate gatherings, and any event where 
                medical safety and emergency preparedness are essential.
              </p>
              
            </div>

            <div className="space-y-6">
              

              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
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
                    <Car className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Transport Ready
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Ambulance services and emergency transport
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Trained Team
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Certified medical professionals on-site
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Full Coverage
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Complete event duration medical support
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Included */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Complete Service Breakdown
            </h2>
            <p className="text-xl text-slate-600">
              Comprehensive medical services included in your Event Medical Coverage
            </p>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <p className="text-slate-600 mt-2">Loading service details...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-600 text-red-600"
                >
                  Retry
                </Button>
              </div>
            ) : eventMedicalService ? (
              eventMedicalService.items.map((item) => renderServiceItem(item))
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-600 text-sm">No service details available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Perfect For These Events
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Sporting Events
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Marathon and running events</li>
                  <li>• Football and soccer matches</li>
                  <li>• Athletic competitions</li>
                  <li>• Cycling events and races</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Entertainment & Corporate
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Music festivals and concerts</li>
                  <li>• Corporate events and conferences</li>
                  <li>• Community festivals</li>
                  <li>• Outdoor gatherings and fairs</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-red-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Secure Medical Coverage for Your Event
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Contact us today to discuss your event medical coverage needs and ensure participant safety.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50">
                Book Event Coverage
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Phone className="h-5 w-5 mr-2" />
                Call Us Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            © 2024 Alpha Rescue Consult. Professional event medical services you can trust.
          </p>
        </div>
      </footer>
    </div>
  );
}
