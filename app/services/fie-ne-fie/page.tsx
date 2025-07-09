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
  Home,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Testimonials from "@/components/testimonials";
import Image from "next/image";

export default function FieNeFiePage() {
  const serviceCategories = [
    {
      category: "Stay In",
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
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <Baby className="h-12 w-12 text-pink-600" />
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                  Fie Ne Fie
                </h1>
              </div>
              <Badge className="bg-purple-100 text-purple-800 mb-4">
                Nanny Service
              </Badge>
              <p className="text-2xl text-slate-700 mb-4">
                Stay-in Nanny Service
              </p>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Comprehensive live-in childcare with professional nanny support,
                basic nursing care, and emergency response capabilities for your
                precious little ones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="bg-pink-600 hover:bg-pink-700 text-white px-8"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-pink-600 text-pink-600 px-8 bg-transparent"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="bg-pink-100 rounded-2xl p-8 text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-pink-600 text-sm font-medium mb-2">
                    IMAGE PLACEHOLDER
                  </div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Professional African nanny reading with happy children in
                    comfortable home setting"
                    <br />
                    <br />
                    Search terms: African nanny, childcare, reading to children,
                    home environment, professional caregiver, happy family
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
                Professional Live-in Childcare
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Fie Ne Fie provides dedicated live-in nanny services with
                trained professionals who offer comprehensive childcare, basic
                nursing support, and educational assistance for your children's
                development and well-being.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Perfect for working parents who need reliable, professional
                childcare with the added security of basic medical support and
                emergency response capabilities.
              </p>
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="h-6 w-6 text-pink-600" />
                  <h3 className="text-xl font-semibold text-slate-900">
                    Starting from GHS 120 per day
                  </h3>
                </div>
                <p className="text-slate-600">
                  Comprehensive childcare with optional educational and care
                  services.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Service Overview Image */}
              <div className="bg-purple-100 rounded-2xl p-6 text-center">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="text-purple-600 text-sm font-medium mb-2">
                    IMAGE PLACEHOLDER
                  </div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Nanny helping child with homework at kitchen table, warm
                    home atmosphere"
                    <br />
                    <br />
                    Search terms: nanny tutoring, homework help, educational
                    support, home learning, childcare assistance
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Baby className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Live-in Care
                    </h3>
                    <p className="text-slate-600 text-sm">
                      24/7 professional nanny support in your home
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
                      Family Updates
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Regular communication and progress reports
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
              Comprehensive childcare services included in your Fie Ne Fie
              package
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {serviceCategories.map((category, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-pink-600">
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
              Why Choose Fie Ne Fie?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Home Environment
              </h3>
              <p className="text-slate-600">
                Children stay in their familiar, comfortable home environment
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
                24/7 Support
              </h3>
              <p className="text-slate-600">
                Round-the-clock care and supervision for complete peace of mind
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Fie Ne Fie Care?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Contact us today to learn more about our comprehensive stay-in nanny
            services and how we can support your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-pink-50"
              >
                Start Your Childcare Journey
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
