"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, Phone, Check, Plus, Minus } from "lucide-react";
import { createApplication } from "@/lib/api/applications";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";

// Types for dynamic service data
interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  level: number;
  isOptional?: boolean;
  basePrice?: number;
  children?: ServiceItem[];
}

interface DynamicService {
  id: string;
  name: string;
  description?: string;
  basePrice?: number;
  items: ServiceItem[];
}

interface SelectedAddon {
  id: string;
  name: string;
  price: number;
  parentFeatureId: string;
}

export default function GetStartedPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [dynamicServices, setDynamicServices] = useState<DynamicService[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    serviceId: "",
    startDate: "",
    duration: "",
    careNeeds: "",
    preferredContact: "",
    selectedFeatures: [] as string[], // IDs of selected optional features
    customizations: "", // Additional customization notes
  });

  // Fetch dynamic services data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        const response = await fetch("/api/services/pricing");
        const result = await response.json();

        if (result.success && result.data) {
          setDynamicServices(result.data);

          // Handle service pre-selection from URL parameters
          const serviceParam = searchParams.get("service");
          if (serviceParam && result.data.length > 0) {
            // Try to find service by slug, name, or ID
            const preSelectedService = result.data.find(
              (service: DynamicService) =>
                service.name.toLowerCase().replace(/\s+/g, "-") ===
                  serviceParam.toLowerCase() ||
                service.name.toLowerCase() === serviceParam.toLowerCase() ||
                service.id === serviceParam
            );

            if (preSelectedService) {
              setFormData((prev) => ({
                ...prev,
                serviceId: preSelectedService.id,
              }));

              // Show a toast to indicate pre-selection
              toast({
                title: "Service Pre-selected",
                description: `${preSelectedService.name} has been selected for you.`,
              });
            }
          }
        } else {
          console.error("Failed to fetch services:", result.error);
          toast({
            title: "Error Loading Services",
            description:
              "Failed to load service options. Please refresh the page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast({
          title: "Error Loading Services",
          description:
            "Failed to load service options. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, [toast, searchParams]);

  // Helper functions for pricing and selections
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getSelectedService = (): DynamicService | null => {
    return (
      dynamicServices.find((service) => service.id === formData.serviceId) ||
      null
    );
  };

  const calculateTotalPrice = (): number => {
    const selectedService = getSelectedService();
    if (!selectedService) return 0;

    let total = selectedService.basePrice || 0;

    // Add prices for selected addons
    selectedAddons.forEach((addon) => {
      total += addon.price;
    });

    return total;
  };

  const handleAddonToggle = (addon: ServiceItem, parentFeatureId: string) => {
    const addonId = addon.id;
    const existingIndex = selectedAddons.findIndex((a) => a.id === addonId);

    if (existingIndex >= 0) {
      // Remove addon
      setSelectedAddons((prev) => prev.filter((a) => a.id !== addonId));
    } else {
      // Add addon
      setSelectedAddons((prev) => [
        ...prev,
        {
          id: addonId,
          name: addon.name,
          price: addon.basePrice || 0,
          parentFeatureId,
        },
      ]);
    }
  };

  const isAddonSelected = (addonId: string): boolean => {
    return selectedAddons.some((addon) => addon.id === addonId);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (serviceId: string) => {
    setFormData((prev) => ({ ...prev, serviceId }));
    // Clear addon selections when service changes
    setSelectedAddons([]);
  };

  const handleContactMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, preferredContact: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.serviceId
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get selected service
      const selectedService = getSelectedService();

      // Prepare application data with selections
      const applicationData = {
        ...formData,
        serviceName: selectedService?.name || "",
        basePrice: selectedService?.basePrice || 0,
        selectedAddons: selectedAddons,
        totalPrice: calculateTotalPrice(),
        packageDetails: {
          serviceId: formData.serviceId,
          serviceName: selectedService?.name || "",
          basePrice: selectedService?.basePrice || 0,
          addons: selectedAddons,
          totalPrice: calculateTotalPrice(),
        },
      };

      // Submit application to API
      await createApplication(applicationData);

      // Show success state
      setIsSubmitted(true);
      window.scrollTo(0, 0);

      toast({
        title: "Application Submitted",
        description:
          "Your application has been submitted successfully. We'll be in touch soon!",
      });
    } catch (error) {
      console.error("Failed to submit application:", error);
      toast({
        title: "Submission Error",
        description:
          "There was a problem submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-muted py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get Started Today
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Tell us about your care needs and we'll create a personalized plan
            for your family.
          </p>
        </div>
      </section>

      {/* Success Message or Booking Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isSubmitted ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Application Submitted Successfully
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium">
                    Thank you for your interest!
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    We've received your application and will review it shortly.
                    One of our care coordinators will contact you within 24
                    hours to discuss your needs.
                  </p>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Next steps: Our team will review your application and
                    contact you to schedule an assessment.
                  </p>
                  <Button onClick={() => router.push("/")}>
                    Return to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Book Your Free Consultation
                </CardTitle>
                <p className="text-muted-foreground text-center">
                  Complete the form below and we'll contact you within 24 hours
                  to discuss your needs.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium mb-2"
                        >
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium mb-2"
                        >
                          Last Name *
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium mb-2"
                        >
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium mb-2"
                        >
                          Phone Number *
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium mb-2"
                      >
                        Address
                      </label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>

                  {/* Service Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Select Your Service
                    </h3>
                    {isLoadingServices ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading services...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dynamicServices.map((service) => (
                          <div key={service.id}>
                            <label className="cursor-pointer block">
                              <input
                                type="radio"
                                name="service"
                                value={service.id}
                                checked={formData.serviceId === service.id}
                                onChange={() => handleServiceChange(service.id)}
                                className="sr-only peer"
                              />
                              <Card
                                className={`peer-checked:ring-2 peer-checked:ring-primary peer-checked:border-primary hover:shadow-md transition-all ${
                                  formData.serviceId &&
                                  formData.serviceId !== service.id
                                    ? "opacity-50"
                                    : ""
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold">
                                      {service.name}
                                    </h4>
                                    {service.name === "AHENEFIE" && (
                                      <Badge>Most Popular</Badge>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground text-sm mb-2">
                                    {service.description ||
                                      "Professional care service"}
                                  </p>
                                  <p className="text-green-600 font-medium text-sm">
                                    Starting from{" "}
                                    {formatPrice(service.basePrice || 0)}
                                  </p>
                                </CardContent>
                              </Card>
                            </label>

                            {/* Service Customization - appears right under selected service */}
                            {formData.serviceId === service.id && (
                              <div className="mt-4 ml-4 border-l-2 border-primary/20 pl-4">
                                <h4 className="text-base font-medium mb-3 text-primary">
                                  Customize Your {service.name} Service
                                </h4>
                                <div className="space-y-2">
                                  {service.items.map((feature) => (
                                    <div key={feature.id} className="space-y-1">
                                      <div className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <span className="text-sm font-medium">
                                            {feature.name}
                                            {feature.isOptional === false && (
                                              <Badge
                                                variant="secondary"
                                                className="ml-2 text-xs"
                                              >
                                                Included
                                              </Badge>
                                            )}
                                          </span>
                                          {feature.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                              {feature.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Show addons for this feature */}
                                      {feature.children &&
                                        feature.children.length > 0 && (
                                          <div className="ml-6 space-y-1">
                                            {feature.children.map((addon) => (
                                              <div key={addon.id}>
                                                {addon.isOptional ? (
                                                  // Optional addon with checkbox
                                                  <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                      <Checkbox
                                                        id={addon.id}
                                                        checked={isAddonSelected(
                                                          addon.id
                                                        )}
                                                        onCheckedChange={() =>
                                                          handleAddonToggle(
                                                            addon,
                                                            feature.id
                                                          )
                                                        }
                                                      />
                                                      <div>
                                                        <label
                                                          htmlFor={addon.id}
                                                          className="text-xs font-medium cursor-pointer"
                                                        >
                                                          {addon.name}
                                                        </label>
                                                        {addon.description && (
                                                          <p className="text-xs text-muted-foreground">
                                                            {addon.description}
                                                          </p>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div className="text-xs font-medium text-green-600">
                                                      +
                                                      {formatPrice(
                                                        addon.basePrice || 0
                                                      )}
                                                    </div>
                                                  </div>
                                                ) : (
                                                  // Required addon without checkbox
                                                  <div className="flex items-start gap-2 py-1 px-2">
                                                    <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                      <span className="text-xs font-medium">
                                                        {addon.name}
                                                        <Badge
                                                          variant="secondary"
                                                          className="ml-2 text-xs"
                                                        >
                                                          Included
                                                        </Badge>
                                                      </span>
                                                      {addon.description && (
                                                        <p className="text-xs text-muted-foreground">
                                                          {addon.description}
                                                        </p>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                    </div>
                                  ))}

                                  {/* Price Summary */}
                                  {selectedAddons.length > 0 && (
                                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                                      <h5 className="text-sm font-medium mb-2">
                                        Price Summary
                                      </h5>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                          <span>Base Service</span>
                                          <span className="text-green-600">
                                            {formatPrice(
                                              service.basePrice || 0
                                            )}
                                          </span>
                                        </div>
                                        {selectedAddons.map((addon) => (
                                          <div
                                            key={addon.id}
                                            className="flex justify-between text-muted-foreground"
                                          >
                                            <span>+ {addon.name}</span>
                                            <span className="text-green-600">
                                              +{formatPrice(addon.price)}
                                            </span>
                                          </div>
                                        ))}
                                        <div className="border-t pt-1 mt-1">
                                          <div className="flex justify-between font-medium text-sm">
                                            <span>Total Price</span>
                                            <span className="text-green-600 font-semibold">
                                              {formatPrice(
                                                calculateTotalPrice()
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Care Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Care Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="startDate"
                          className="block text-sm font-medium mb-2"
                        >
                          Preferred Start Date
                        </label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="duration"
                          className="block text-sm font-medium mb-2"
                        >
                          Expected Duration
                        </label>
                        <select
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="">Select duration</option>
                          <option value="short-term">
                            Short-term (1-4 weeks)
                          </option>
                          <option value="medium-term">
                            Medium-term (1-6 months)
                          </option>
                          <option value="long-term">
                            Long-term (6+ months)
                          </option>
                          <option value="ongoing">Ongoing</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="careNeeds"
                        className="block text-sm font-medium mb-2"
                      >
                        Specific Care Needs
                      </label>
                      <Textarea
                        id="careNeeds"
                        name="careNeeds"
                        value={formData.careNeeds}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Please describe the specific care needs, any medical conditions, preferences, or special requirements..."
                      />
                    </div>

                    {/* Additional Customizations */}
                    <div className="mt-4">
                      <label
                        htmlFor="customizations"
                        className="block text-sm font-medium mb-2"
                      >
                        Additional Customizations
                      </label>
                      <Textarea
                        id="customizations"
                        name="customizations"
                        value={formData.customizations}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Any additional requests, special arrangements, or customizations for your service package..."
                      />
                    </div>
                  </div>

                  {/* Preferred Contact */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Preferred Contact Method
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="phone"
                          checked={formData.preferredContact === "phone"}
                          onChange={handleContactMethodChange}
                          className="text-primary"
                        />
                        <Phone className="h-4 w-4" />
                        <span>Phone Call</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="email"
                          checked={formData.preferredContact === "email"}
                          onChange={handleContactMethodChange}
                          className="text-primary"
                        />
                        <span>Email</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="whatsapp"
                          checked={formData.preferredContact === "whatsapp"}
                          onChange={handleContactMethodChange}
                          className="text-primary"
                        />
                        <span>WhatsApp</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <Button
                      type="submit"
                      className="w-full py-3 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : formData.serviceId && getSelectedService() ? (
                        `Book Free Consultation - ${formatPrice(
                          calculateTotalPrice()
                        )}`
                      ) : (
                        "Book Free Consultation"
                      )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground mt-3">
                      We'll contact you within 24 hours to schedule your
                      consultation
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* What Happens Next */}
      <section className="py-16 bg-background border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Happens Next?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. We Contact You</h3>
              <p className="text-muted-foreground">
                Our care coordinator will call you within 24 hours to discuss
                your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Admin Review</h3>
              <p className="text-muted-foreground">
                Our admin team reviews your application and approves or
                schedules an assessment.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                3. Match & Start Care
              </h3>
              <p className="text-muted-foreground">
                We match you with the perfect care provider and begin your
                personalized care plan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
