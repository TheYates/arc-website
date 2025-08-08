"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Check,
  Baby,
  Shield,
  Phone,
  Car,
  Heart,
  Calendar,
  Users,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Testimonials from "@/components/testimonials";
import Image from "next/image";
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

interface YonkoPaService {
  id: string;
  name: string;
  description: string;
  basePrice?: number;
  items: ServiceItem[];
}

export default function YonkoPaPage() {
  const [yonkoPaService, setYonkoPaService] = useState<YonkoPaService | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fetch YONKO-PA service data from admin
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const response = await fetch("/api/services/yonko-pa");
        const result = await response.json();

        if (result.success && result.data) {
          setYonkoPaService(result.data);
          console.log("Using dynamic data from admin");
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

  // Auto-expand items with children for better UX when service data is loaded
  useEffect(() => {
    if (yonkoPaService) {
      const itemsToExpand = yonkoPaService.items
        .filter((item) => item.children && item.children.length > 0)
        .slice(0, 2) // Expand first 2 items with children
        .map((item) => item.id);
      setExpandedItems(new Set(itemsToExpand));
    }
  }, [yonkoPaService]);

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
                        <CardTitle className="text-lg font-semibold text-indigo-700 flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          {item.name}
                        </CardTitle>
                        {item.isOptional && (
                          <Badge
                            variant="outline"
                            className="text-orange-600 border-orange-200 bg-orange-50"
                          >
                            Optional
                            {item.basePrice && item.basePrice > 0 && (
                              <span className="ml-2 text-green-600 font-medium">
                                + {formatPrice(item.basePrice)}
                              </span>
                            )}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <CardDescription className="text-slate-600 mt-2 text-sm leading-relaxed">
                          {item.description}
                        </CardDescription>
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
                      {item.children?.map((child) => renderServiceItem(child))}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <CardHeader className="py-4 px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-indigo-700 flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      {item.name}
                    </CardTitle>
                    {item.isOptional && (
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200 bg-orange-50"
                      >
                        Optional
                        {item.basePrice && item.basePrice > 0 && (
                          <span className="ml-2 text-green-600 font-medium">
                            + {formatPrice(item.basePrice)}
                          </span>
                        )}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <CardDescription className="text-slate-600 mt-2 text-sm leading-relaxed">
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

    // Render nested items (level > 1) with improved styling
    return (
      <div key={item.id} className="border-l-4 border-indigo-200 pl-4 py-2">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          {item.name}
        </h4>
        {item.description && (
          <p className="text-sm text-slate-600 mb-3 ml-6 leading-relaxed">
            {item.description}
          </p>
        )}
        {item.children && item.children.length > 0 && (
          <div className="ml-6 space-y-2">
            <div className="text-sm font-medium text-slate-700 mb-2">
              Includes:
            </div>
            <div className="space-y-1">
              {item.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-start gap-3 text-sm py-1"
                >
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-medium">
                        {child.name}
                      </span>
                      {child.isOptional &&
                        child.basePrice &&
                        child.basePrice > 0 && (
                          <Badge
                            variant="outline"
                            className="text-orange-600 border-orange-200 bg-orange-50 text-xs"
                          >
                            Optional +{formatPrice(child.basePrice)}
                          </Badge>
                        )}
                    </div>
                    {child.description && (
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                        {child.description}
                      </p>
                    )}
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
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://images.pexels.com/photos/69096/pexels-photo-69096.jpeg"
            alt="Flexible childcare and visit-on-request services"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-cyan-900/30"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <Calendar className="h-12 w-12 text-indigo-300" />
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  {yonkoPaService?.name || "YONKO PA"}
                </h1>
              </div>
              <Badge className="bg-white/20 text-white border border-white/30 mb-4">
                Nanny Service
              </Badge>
              <p className="text-2xl text-indigo-100 mb-4">
                Visit-on-Request Nanny Service
              </p>
              <p className="text-xl font-medium text-white/90 leading-relaxed mb-8">
                {yonkoPaService?.description}
              </p>
              {yonkoPaService?.basePrice && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                    <span className="text-white font-semibold">
                      Starting from {formatPrice(yonkoPaService.basePrice || 0)}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-8"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-indigo-900 px-8 bg-transparent"
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
                Flexible On-Demand Childcare
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                YONKO PA offers professional nanny services on a
                visit-on-request basis, providing you with the flexibility to
                schedule childcare support exactly when you need it, whether for
                a few hours or extended periods.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Ideal for parents with varying schedules, special events,
                emergency situations, or those who need occasional professional
                childcare support with basic nursing capabilities.
              </p>
              {yonkoPaService?.basePrice && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Heart className="h-6 w-6 text-indigo-600" />
                    <h3 className="text-xl font-semibold text-slate-900">
                      Starting from {formatPrice(yonkoPaService.basePrice)} per
                      visit
                    </h3>
                  </div>
                  <p className="text-slate-600">
                    Flexible pricing based on duration and specific services
                    requested.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Service Overview Image */}

              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Calendar className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      On-Demand
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Schedule visits exactly when you need them
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Medical Support
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Basic nursing and emergency response capabilities
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Educational Support
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Optional tuition and learning assistance
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Easy Booking
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Simple scheduling and family coordination
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Included */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Complete Service Breakdown
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive childcare services available with your YONKO PA
              visits
            </p>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-slate-600 mt-4 text-base">
                  Loading service details...
                </p>
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
            ) : yonkoPaService ? (
              yonkoPaService.items.map((item) => renderServiceItem(item))
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

      {/* Key Benefits */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose YONKO PA?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Ultimate Flexibility
              </h3>
              <p className="text-slate-600">
                Book visits only when you need them, perfect for varying
                schedules
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Professional Care
              </h3>
              <p className="text-slate-600">
                Trained nannies with basic nursing and emergency response skills
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Cost Effective
              </h3>
              <p className="text-slate-600">
                Pay only for the visits you need, no ongoing commitments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Perfect For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Working Parents
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Late meetings or overtime work</li>
                  <li>• Business trips or travel</li>
                  <li>• Irregular work schedules</li>
                  <li>• Emergency childcare needs</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Special Occasions
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Date nights and social events</li>
                  <li>• Medical appointments</li>
                  <li>• Family emergencies</li>
                  <li>• Personal time and self-care</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Book Your First {yonkoPaService?.name || "YONKO PA"} Visit?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Contact us today to learn more about our flexible visit-on-request
            nanny services and schedule your first visit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-indigo-50"
              >
                Book Your First Visit
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
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
            © 2024 Alpha Rescue Consult. Professional childcare services you can
            trust.
          </p>
        </div>
      </footer>
    </div>
  );
}
