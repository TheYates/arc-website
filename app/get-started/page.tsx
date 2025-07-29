"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Phone } from "lucide-react";
import { createApplication } from "@/lib/api/applications";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function GetStartedPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
  });

  const services = [
    {
      id: "ahenefie",
      name: "AHENEFIE",
      description: "Live-in home care package",
      price: "Starting from GHS 200/day",
      popular: true,
    },
    {
      id: "adamfo-pa",
      name: "ADAMFO PA",
      description: "Daily home visit package",
      price: "Starting from GHS 80/visit",
      popular: false,
    },
    {
      id: "fie-ne-fie",
      name: "Fie Ne Fie",
      description: "Stay-in nanny service",
      price: "Starting from GHS 150/day",
      popular: false,
    },
    {
      id: "yonko-pa",
      name: "YONKO PA",
      description: "Visit-on-request nanny service",
      price: "Starting from GHS 50/hour",
      popular: false,
    },
  ];

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
      // Get selected service name
      const selectedService = services.find(
        (service) => service.id === formData.serviceId
      );

      // Submit application to API
      await createApplication({
        ...formData,
        serviceName: selectedService?.name || "",
      });

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
                    <div className="grid md:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <label key={service.id} className="cursor-pointer">
                          <input
                            type="radio"
                            name="service"
                            value={service.id}
                            checked={formData.serviceId === service.id}
                            onChange={() => handleServiceChange(service.id)}
                            className="sr-only peer"
                          />
                          <Card className="peer-checked:ring-2 peer-checked:ring-primary peer-checked:border-primary hover:shadow-md transition-all">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">
                                  {service.name}
                                </h4>
                                {service.popular && <Badge>Most Popular</Badge>}
                              </div>
                              <p className="text-muted-foreground text-sm mb-2">
                                {service.description}
                              </p>
                              <p className="text-primary font-medium text-sm">
                                {service.price}
                              </p>
                            </CardContent>
                          </Card>
                        </label>
                      ))}
                    </div>
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
