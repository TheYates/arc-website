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
  Check,
  Clock,
  Shield,
  Phone,
  Car,
  Heart,
  Home,
  Users,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Testimonials from "@/components/testimonials";
import Image from "next/image";

export default function AdamfoPaPage() {
  const serviceCategories = [
    {
      category: "Home Visitation (Daily)",
      items: [
        "Basic nursing",
        "Vital signs monitoring",
        "Wound care management",
        "Medication management (Optional)",
        "Lab call (Optional)",
        "Review",
        "Remote review (ARC staff)",
        "Facility reviews planning (Optional)",
        "Booking for facility engagement",
        "Transportation and support to reviewing facility (Optional)",
        "Information sharing with review facility",
        "ARC to review facility",
        "Review facility to ARC",
      ],
    },
    {
      category: "Emergency Response and Management",
      items: [
        "1st respondent First Aid, Stop the Bleed & BLS",
        "Secondary response (variable)",
        "Emergency ground transport (Pick & Run)",
        "ARC Ambulance (when available)",
        "National ambulance service",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <Calendar className="h-12 w-12 text-blue-600" />
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                  ADAMFO PA
                </h1>
              </div>
              <p className="text-2xl text-slate-700 mb-4">
                Daily Home Visitation Package
              </p>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Professional daily home visits with comprehensive nursing care,
                facility reviews, and emergency response support for your loved
                ones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-600 text-blue-600 px-8 bg-transparent"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="bg-blue-100 rounded-2xl p-8 text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-blue-600 text-sm font-medium mb-2">
                    IMAGE PLACEHOLDER
                  </div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Nurse with medical bag walking up to front door of family
                    home for daily visit"
                    <br />
                    <br />
                    Search terms: home healthcare visit, daily nursing care,
                    medical house call, professional caregiver arrival, home
                    health services
                  </div>
                </div>
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
                Daily Professional Care Visits
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                ADAMFO PA provides scheduled daily visits from certified
                healthcare professionals, ensuring consistent care and
                monitoring for your family member while maintaining their
                independence at home.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Ideal for individuals who need regular medical monitoring,
                medication management, and professional care support but don't
                require 24/7 live-in assistance.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-slate-900">
                    Starting from GHS 80 per day
                  </h3>
                </div>
                <p className="text-slate-600">
                  Flexible scheduling with optional services available based on
                  your needs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Daily Visits
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Scheduled professional care visits every day
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Emergency Ready
                  </h3>
                  <p className="text-slate-600 text-sm">
                    24/7 emergency response and transport services
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Facility Reviews
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Professional facility assessments and planning
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Family Updates
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Regular communication and care coordination
                  </p>
                </CardContent>
              </Card>
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
              Comprehensive daily care services included in your ADAMFO PA
              package
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {serviceCategories.map((category, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-blue-600">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start space-x-3"
                      >
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose ADAMFO PA?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Independence at Home
              </h3>
              <p className="text-slate-600">
                Maintain independence while receiving professional care support
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Professional Care
              </h3>
              <p className="text-slate-600">
                Certified healthcare professionals providing quality care
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Flexible Scheduling
              </h3>
              <p className="text-slate-600">
                Daily visits scheduled around your family's routine
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start ADAMFO PA Care?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Contact us today to schedule your consultation and learn how our
            daily care visits can support your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Start Your Care Plan
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
            © 2024 Alpha Rescue Consult. Professional healthcare services you
            can trust.
          </p>
        </div>
      </footer>
    </div>
  );
}
