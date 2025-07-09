import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import Link from "next/link";
import Testimonials from "@/components/testimonials";
import Image from "next/image";

export default function YonkoPaPage() {
  const serviceCategories = [
    {
      category: "Visit on Request",
      items: [
        "Basic nursing",
        "Vital signs monitoring",
        "Wound care management (Optional)",
        "Medication management (Optional)",
        "Tuition (Optional)",
        "Laundry (Optional)",
        "Lab call (Optional)",
        "Review",
      ],
    },
    {
      category: "Remote Review (ARC Staff)",
      items: [
        "Facility reviews planning (Optional)",
        "Booking for facility engagement (Optional dependent on age)",
        "Transportation and support to reviewing facility (Optional)",
        "Information sharing with review facility (Optional)",
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
      <section className="bg-gradient-to-br from-indigo-50 to-cyan-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <Calendar className="h-12 w-12 text-indigo-600" />
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                  YONKO PA
                </h1>
              </div>
              <Badge className="bg-indigo-100 text-indigo-800 mb-4">
                Nanny Service
              </Badge>
              <p className="text-2xl text-slate-700 mb-4">
                Visit-on-Request Nanny Service
              </p>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Flexible childcare support with professional nanny visits
                scheduled when you need them most. Perfect for busy families who
                need reliable, on-demand childcare assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-indigo-600 text-indigo-600 px-8 bg-transparent"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="bg-indigo-100 rounded-2xl p-8 text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-indigo-600 text-sm font-medium mb-2">
                    IMAGE PLACEHOLDER
                  </div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Professional nanny arriving at family home with bag,
                    parents greeting at door"
                    <br />
                    <br />
                    Search terms: nanny arrival, on-demand childcare, flexible
                    babysitting, professional caregiver visit, family doorway
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
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-xl font-semibold text-slate-900">
                    Starting from GHS 60 per visit
                  </h3>
                </div>
                <p className="text-slate-600">
                  Flexible pricing based on duration and specific services
                  requested.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Service Overview Image */}
              <div className="bg-cyan-100 rounded-2xl p-6 text-center">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="text-cyan-600 text-sm font-medium mb-2">
                    IMAGE PLACEHOLDER
                  </div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Parent using smartphone to schedule nanny visit, calendar
                    app visible"
                    <br />
                    <br />
                    Search terms: mobile scheduling, childcare booking app,
                    on-demand service, flexible babysitting, parent planning
                  </div>
                </div>
              </div>

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
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Complete Service Breakdown
            </h2>
            <p className="text-xl text-slate-600">
              Comprehensive childcare services available with your YONKO PA
              visits
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {serviceCategories.map((category, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-indigo-600">
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
            Ready to Book Your First YONKO PA Visit?
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
