"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingItem } from "@/lib/types/packages";

export default function PricingPage() {
  const [services, setServices] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");



  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      // Fetch admin pricing data from API
      const response = await fetch('/api/admin/pricing');
      if (!response.ok) {
        throw new Error('Failed to fetch pricing data');
      }
      const result = await response.json();
      if (result.success) {
        setServices(result.data);
      } else {
        throw new Error(result.error || 'Failed to load pricing data');
      }
    } catch (err) {
      setError("Failed to load service information");
      console.error("Error loading services:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render feature with add-ons (same as admin preview)
  const renderFeatureWithAddons = (feature: PricingItem) => {
    return (
      <div key={feature.id} className="space-y-3">
        {/* Main Feature */}
        <div className="flex items-center gap-3">
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">{feature.name}</span>
          {!feature.isRequired && (
            <span className="text-xs text-green-600 font-medium">
              optional
            </span>
          )}
        </div>

        {/* Add-ons under this feature */}
        {feature.children && feature.children.length > 0 && (
          <div className="ml-6 space-y-1">
            {feature.children.map((addon) => (
              <div key={addon.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span>{addon.name}</span>
                {!addon.isRequired && (
                  <span className="text-green-600 font-medium">
                    optional
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Render plan card (same as admin preview)
  const renderPlan = (plan: PricingItem) => {
    return (
      <Card key={plan.id} className="relative">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
        </CardHeader>

        <CardContent>
          <div className="space-y-4 mb-6">
            {plan.children?.map((feature) => renderFeatureWithAddons(feature))}
          </div>

          <Button className="w-full">
            Select Plan
          </Button>
        </CardContent>
      </Card>
    )
  }





  return (
    <div className="bg-white">
      <Header />

      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-teal-600">
              Pricing
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Transparent Pricing for Quality Care
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
            Choose the perfect care package for your family. Professional
            healthcare and childcare services designed to give you peace of
            mind.
          </p>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading pricing information...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-800 mb-4">{error}</p>
                <Button
                  onClick={loadServices}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <div className="mt-16">
              {/* Services from Admin */}
              {services.map((service) => (
                <div key={service.id} className="mb-12">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">{service.name}</h2>
                    {service.description && <p className="text-xl text-muted-foreground">{service.description}</p>}
                  </div>

                  {/* Plans Grid - dynamic layout based on number of plans */}
                  {service.children && service.children.length > 0 && (
                    <div className={`grid gap-6 mb-8 ${
                      service.children.length === 1
                        ? "max-w-md mx-auto"
                        : service.children.length === 2
                        ? "md:grid-cols-2 max-w-4xl mx-auto"
                        : "md:grid-cols-3 max-w-6xl mx-auto"
                    }`}>
                      {service.children.map((plan) => renderPlan(plan))}
                    </div>
                  )}
                </div>
              ))}

              {/* Custom Package CTA Section */}
              <section className="mt-20 bg-gray-50 py-16 rounded-2xl">
                <div className="max-w-4xl mx-auto px-6 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Need a Custom Package?
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    Every family is unique. Contact us to discuss your specific needs and get a
                    personalized quote.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-teal-600 hover:bg-teal-700 text-white px-8"
                      onClick={() => window.location.href = '/contact'}
                    >
                      Get Custom Quote
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-teal-600 text-teal-600 px-8 hover:bg-teal-50"
                      onClick={() => window.location.href = '/contact'}
                    >
                      Schedule Consultation
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
