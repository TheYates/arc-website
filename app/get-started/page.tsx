"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Phone, Check } from "lucide-react";
import { createPublicApplication } from "@/lib/api/applications";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

// Types for dynamic service data
interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  level: number;
  isOptional?: boolean;
  children?: ServiceItem[];
}

interface DynamicService {
  id: string;
  name: string;
  description?: string;
  colorTheme?: string; // Add colorTheme property
  comingSoon?: boolean; // Add comingSoon property
  items: ServiceItem[];
}

// Color theme mapping for services (same as admin section)
const getServiceColorClasses = (colorTheme: string = "teal") => {
  const colorMap = {
    teal: {
      border: "border-teal-500",
      bg: "from-teal-50 to-teal-100",
      hover: "hover:from-teal-100 hover:to-teal-200",
      badge: "text-teal-600 border-teal-300 bg-teal-50",
      text: "text-teal-700",
      ring: "peer-checked:ring-teal-500",
      borderChecked: "peer-checked:border-teal-500",
    },
    blue: {
      border: "border-blue-500",
      bg: "from-blue-50 to-blue-100",
      hover: "hover:from-blue-100 hover:to-blue-200",
      badge: "text-blue-600 border-blue-300 bg-blue-50",
      text: "text-blue-700",
      ring: "peer-checked:ring-blue-500",
      borderChecked: "peer-checked:border-blue-500",
    },
    purple: {
      border: "border-purple-500",
      bg: "from-purple-50 to-purple-100",
      hover: "hover:from-purple-100 hover:to-purple-200",
      badge: "text-purple-600 border-purple-300 bg-purple-50",
      text: "text-purple-700",
      ring: "peer-checked:ring-purple-500",
      borderChecked: "peer-checked:border-purple-500",
    },
    indigo: {
      border: "border-indigo-500",
      bg: "from-indigo-50 to-indigo-100",
      hover: "hover:from-indigo-100 hover:to-indigo-200",
      badge: "text-indigo-600 border-indigo-300 bg-indigo-50",
      text: "text-indigo-700",
      ring: "peer-checked:ring-indigo-500",
      borderChecked: "peer-checked:border-indigo-500",
    },
    red: {
      border: "border-red-500",
      bg: "from-red-50 to-red-100",
      hover: "hover:from-red-100 hover:to-red-200",
      badge: "text-red-600 border-red-300 bg-red-50",
      text: "text-red-700",
      ring: "peer-checked:ring-red-500",
      borderChecked: "peer-checked:border-red-500",
    },
    green: {
      border: "border-green-500",
      bg: "from-green-50 to-green-100",
      hover: "hover:from-green-100 hover:to-green-200",
      badge: "text-green-600 border-green-300 bg-green-50",
      text: "text-green-700",
      ring: "peer-checked:ring-green-500",
      borderChecked: "peer-checked:border-green-500",
    },
    orange: {
      border: "border-orange-500",
      bg: "from-orange-50 to-orange-100",
      hover: "hover:from-orange-100 hover:to-orange-200",
      badge: "text-orange-600 border-orange-300 bg-orange-50",
      text: "text-orange-700",
      ring: "peer-checked:ring-orange-500",
      borderChecked: "peer-checked:border-orange-500",
    },
    amber: {
      border: "border-amber-500",
      bg: "from-amber-50 to-amber-100",
      hover: "hover:from-amber-100 hover:to-amber-200",
      badge: "text-amber-600 border-amber-300 bg-amber-50",
      text: "text-amber-700",
      ring: "peer-checked:ring-amber-500",
      borderChecked: "peer-checked:border-amber-500",
    },
    yellow: {
      border: "border-yellow-500",
      bg: "from-yellow-50 to-yellow-100",
      hover: "hover:from-yellow-100 hover:to-yellow-200",
      badge: "text-yellow-600 border-yellow-300 bg-yellow-50",
      text: "text-yellow-700",
      ring: "peer-checked:ring-yellow-500",
      borderChecked: "peer-checked:border-yellow-500",
    },
    lime: {
      border: "border-lime-500",
      bg: "from-lime-50 to-lime-100",
      hover: "hover:from-lime-100 hover:to-lime-200",
      badge: "text-lime-600 border-lime-300 bg-lime-50",
      text: "text-lime-700",
      ring: "peer-checked:ring-lime-500",
      borderChecked: "peer-checked:border-lime-500",
    },
    emerald: {
      border: "border-emerald-500",
      bg: "from-emerald-50 to-emerald-100",
      hover: "hover:from-emerald-100 hover:to-emerald-200",
      badge: "text-emerald-600 border-emerald-300 bg-emerald-50",
      text: "text-emerald-700",
      ring: "peer-checked:ring-emerald-500",
      borderChecked: "peer-checked:border-emerald-500",
    },
    cyan: {
      border: "border-cyan-500",
      bg: "from-cyan-50 to-cyan-100",
      hover: "hover:from-cyan-100 hover:to-cyan-200",
      badge: "text-cyan-600 border-cyan-300 bg-cyan-50",
      text: "text-cyan-700",
      ring: "peer-checked:ring-cyan-500",
      borderChecked: "peer-checked:border-cyan-500",
    },
    sky: {
      border: "border-sky-500",
      bg: "from-sky-50 to-sky-100",
      hover: "hover:from-sky-100 hover:to-sky-200",
      badge: "text-sky-600 border-sky-300 bg-sky-50",
      text: "text-sky-700",
      ring: "peer-checked:ring-sky-500",
      borderChecked: "peer-checked:border-sky-500",
    },
    violet: {
      border: "border-violet-500",
      bg: "from-violet-50 to-violet-100",
      hover: "hover:from-violet-100 hover:to-violet-200",
      badge: "text-violet-600 border-violet-300 bg-violet-50",
      text: "text-violet-700",
      ring: "peer-checked:ring-violet-500",
      borderChecked: "peer-checked:border-violet-500",
    },
    fuchsia: {
      border: "border-fuchsia-500",
      bg: "from-fuchsia-50 to-fuchsia-100",
      hover: "hover:from-fuchsia-100 hover:to-fuchsia-200",
      badge: "text-fuchsia-600 border-fuchsia-300 bg-fuchsia-50",
      text: "text-fuchsia-700",
      ring: "peer-checked:ring-fuchsia-500",
      borderChecked: "peer-checked:border-fuchsia-500",
    },
    pink: {
      border: "border-pink-500",
      bg: "from-pink-50 to-pink-100",
      hover: "hover:from-pink-100 hover:to-pink-200",
      badge: "text-pink-600 border-pink-300 bg-pink-50",
      text: "text-pink-700",
      ring: "peer-checked:ring-pink-500",
      borderChecked: "peer-checked:border-pink-500",
    },
    rose: {
      border: "border-rose-500",
      bg: "from-rose-50 to-rose-100",
      hover: "hover:from-rose-100 hover:to-rose-200",
      badge: "text-rose-600 border-rose-300 bg-rose-50",
      text: "text-rose-700",
      ring: "peer-checked:ring-rose-500",
      borderChecked: "peer-checked:border-rose-500",
    },
    slate: {
      border: "border-slate-500",
      bg: "from-slate-50 to-slate-100",
      hover: "hover:from-slate-100 hover:to-slate-200",
      badge: "text-slate-600 border-slate-300 bg-slate-50",
      text: "text-slate-700",
      ring: "peer-checked:ring-slate-500",
      borderChecked: "peer-checked:border-slate-500",
    },
    gray: {
      border: "border-gray-500",
      bg: "from-gray-50 to-gray-100",
      hover: "hover:from-gray-100 hover:to-gray-200",
      badge: "text-gray-600 border-gray-300 bg-gray-50",
      text: "text-gray-700",
      ring: "peer-checked:ring-gray-500",
      borderChecked: "peer-checked:border-gray-500",
    },
    zinc: {
      border: "border-zinc-500",
      bg: "from-zinc-50 to-zinc-100",
      hover: "hover:from-zinc-100 hover:to-zinc-200",
      badge: "text-zinc-600 border-zinc-300 bg-zinc-50",
      text: "text-zinc-700",
      ring: "peer-checked:ring-zinc-500",
      borderChecked: "peer-checked:border-zinc-500",
    },
    neutral: {
      border: "border-neutral-500",
      bg: "from-neutral-50 to-neutral-100",
      hover: "hover:from-neutral-100 hover:to-neutral-200",
      badge: "text-neutral-600 border-neutral-300 bg-neutral-50",
      text: "text-neutral-700",
      ring: "peer-checked:ring-neutral-500",
      borderChecked: "peer-checked:border-neutral-500",
    },
    stone: {
      border: "border-stone-500",
      bg: "from-stone-50 to-stone-100",
      hover: "hover:from-stone-100 hover:to-stone-200",
      badge: "text-stone-600 border-stone-300 bg-stone-50",
      text: "text-stone-700",
      ring: "peer-checked:ring-stone-500",
      borderChecked: "peer-checked:border-stone-500",
    },
  };

  return colorMap[colorTheme as keyof typeof colorMap] || colorMap.teal;
};

function GetStartedContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [dynamicServices, setDynamicServices] = useState<DynamicService[]>([]);

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
    careNeeds: "",
    preferredContact: "",
    customizations: "", // Additional customization notes
  });

  // Separate state for selected optional features
  const [selectedOptionalFeatures, setSelectedOptionalFeatures] = useState<Set<string>>(new Set());

  const [selectedDate, setSelectedDate] = useState<Date>();

  // Fetch dynamic services data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        const response = await fetch("/api/services/pricing");
        const result = await response.json();

        if (result.success && result.data) {
          // Filter out "coming soon" services from the get-started page
          // Only show services that are available for booking
          const availableServices = result.data.filter((service: DynamicService) => !service.comingSoon);

          console.log(`Loaded ${result.data.length} total services, ${availableServices.length} available for booking`);
          setDynamicServices(availableServices);

          // Handle service pre-selection from URL parameters
          const serviceParam = searchParams.get("service");
          if (serviceParam && availableServices.length > 0) {
            // Try to find service by slug, name, or ID (only from available services)
            const preSelectedService = availableServices.find(
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

  // Sync selected date with form data
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      setFormData((prev) => ({
        ...prev,
        startDate: formattedDate,
      }));
    }
  }, [selectedDate]);

  // Helper functions for service selection
  const getSelectedService = (): DynamicService | null => {
    return (
      dynamicServices.find((service) => service.id === formData.serviceId) ||
      null
    );
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

      // Prepare application data
      const applicationData = {
        ...formData,
        serviceName: selectedService?.name || "",
        selectedOptionalFeatures: Array.from(selectedOptionalFeatures), // Convert Set to Array
      };

      // Submit application to API
      await createPublicApplication(applicationData);

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
                        {dynamicServices.map((service) => {
                          // Get color theme for this service
                          const colors = getServiceColorClasses(
                            service.colorTheme
                          );

                          return (
                            <div key={service.id}>
                              <label className="cursor-pointer block">
                                <input
                                  type="radio"
                                  name="service"
                                  value={service.id}
                                  checked={formData.serviceId === service.id}
                                  onChange={() =>
                                    handleServiceChange(service.id)
                                  }
                                  className="sr-only peer"
                                />
                                <Card
                                  className={`${colors.ring} ${
                                    colors.borderChecked
                                  } peer-checked:ring-2 hover:shadow-md transition-all bg-gradient-to-br ${
                                    colors.bg
                                  } ${colors.hover} ${
                                    formData.serviceId &&
                                    formData.serviceId !== service.id
                                      ? "opacity-50"
                                      : ""
                                  }`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4
                                        className={`font-semibold ${colors.text}`}
                                      >
                                        {service.name}
                                      </h4>
                                      {service.name === "AHENEFIE" && (
                                        <Badge className={colors.badge}>
                                          Most Popular
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                      {service.description ||
                                        "Professional care service"}
                                    </p>
                                  </CardContent>
                                </Card>
                              </label>

                              {/* Service Customization - appears right under selected service */}
                              {formData.serviceId === service.id && (
                                <div
                                  className={`mt-4 ml-4 border-l-2 border-l-${
                                    service.colorTheme || "teal"
                                  }-500/20 pl-4`}
                                >
                                  <h4
                                    className={`text-base font-medium mb-3 ${colors.text}`}
                                  >
                                    Customize Your {service.name} Service
                                  </h4>
                                  <div className="space-y-2">
                                    {service.items.map((feature) => (
                                      <div
                                        key={feature.id}
                                        className="space-y-1"
                                      >
                                        <div className="flex items-start gap-2">
                                          {feature.isOptional ? (
                                            <Checkbox
                                              id={`feature-${feature.id}`}
                                              checked={selectedOptionalFeatures.has(feature.id)}
                                              onCheckedChange={(checked) => {
                                                const newSelection = new Set(selectedOptionalFeatures);
                                                if (checked) {
                                                  newSelection.add(feature.id);
                                                } else {
                                                  newSelection.delete(feature.id);
                                                }
                                                setSelectedOptionalFeatures(newSelection);
                                              }}
                                              className="mt-0.5"
                                            />
                                          ) : (
                                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                          )}
                                          <div className="flex-1">
                                            <label
                                              htmlFor={feature.isOptional ? `feature-${feature.id}` : undefined}
                                              className={`text-sm font-medium ${feature.isOptional ? 'cursor-pointer' : ''}`}
                                            >
                                              {feature.name}
                                              {feature.isOptional === false && (
                                                <Badge
                                                  variant="secondary"
                                                  className="ml-2 text-xs"
                                                >
                                                  Included
                                                </Badge>
                                              )}
                                              {feature.isOptional && (
                                                <Badge
                                                  variant="outline"
                                                  className="ml-2 text-xs"
                                                >
                                                  Optional
                                                </Badge>
                                              )}
                                            </label>
                                            {feature.description && (
                                              <p className="text-xs text-muted-foreground mt-0.5">
                                                {feature.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        {/* Show sub-features for this feature */}
                                        {feature.children &&
                                          feature.children.length > 0 && (
                                            <div className="ml-6 space-y-1">
                                              {feature.children.map(
                                                (subFeature) => (
                                                  <div
                                                    key={subFeature.id}
                                                    className="flex items-start gap-2 py-1 px-2"
                                                  >
                                                    {subFeature.isOptional ? (
                                                      <Checkbox
                                                        id={`subfeature-${subFeature.id}`}
                                                        checked={selectedOptionalFeatures.has(subFeature.id)}
                                                        onCheckedChange={(checked) => {
                                                          const newSelection = new Set(selectedOptionalFeatures);
                                                          if (checked) {
                                                            newSelection.add(subFeature.id);
                                                          } else {
                                                            newSelection.delete(subFeature.id);
                                                          }
                                                          setSelectedOptionalFeatures(newSelection);
                                                        }}
                                                        className="mt-0.5"
                                                      />
                                                    ) : (
                                                      <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1">
                                                      <label
                                                        htmlFor={subFeature.isOptional ? `subfeature-${subFeature.id}` : undefined}
                                                        className={`text-xs font-medium ${subFeature.isOptional ? 'cursor-pointer' : ''}`}
                                                      >
                                                        {subFeature.name}
                                                        {!subFeature.isOptional && (
                                                          <Badge
                                                            variant="secondary"
                                                            className="ml-2 text-xs"
                                                          >
                                                            Included
                                                          </Badge>
                                                        )}
                                                        {subFeature.isOptional && (
                                                          <Badge
                                                            variant="outline"
                                                            className="ml-2 text-xs"
                                                          >
                                                            Optional
                                                          </Badge>
                                                        )}
                                                      </label>
                                                      {subFeature.description && (
                                                        <p className="text-xs text-muted-foreground">
                                                          {
                                                            subFeature.description
                                                          }
                                                        </p>
                                                      )}
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Care Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Care Details</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Preferred Start Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                <CalendarIcon className="h-8 w-8 text-primary" />
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

export default function GetStartedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <GetStartedContent />
    </Suspense>
  );
}
