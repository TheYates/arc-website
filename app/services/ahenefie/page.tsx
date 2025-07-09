import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Shield, Clock, Heart, Phone } from "lucide-react";
import Link from "next/link";
import Testimonials from "@/components/testimonials";
import Image from "next/image";

export default function AhenefiePage() {
  const serviceCategories = [
    {
      category: "Live-in Option",
      items: [
        "Basic nursing",
        "Vital signs monitoring",
        "Wound care management",
        "Medication management",
        "Lab call (Optional)",
        "Laundry Call (Optional)",
        "Review",
      ],
    },
    {
      category: "Remote Review (ARC Staff)",
      items: [
        "Facility reviews planning (Optional)",
        "Booking for facility engagement",
        "Transportation and support to reviewing facility",
        "Information sharing with review facility",
        "ARC to review facility",
        "Review facility to ARC",
      ],
    },
    {
      category: "Emergency Response and Management",
      items: [
        "1st respondent First Aid, Stop the Bleed & BLS",
        "Secondary response",
        "ACLS",
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
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <Shield className="h-12 w-12 text-teal-600" />
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                  AHENEFIE
                </h1>
              </div>
              <p className="text-2xl text-slate-700 mb-4">
                Live-in Home Care Package
              </p>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Comprehensive 24/7 home care with dedicated live-in support for
                your loved ones who need continuous care and attention.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-teal-600 text-teal-600 px-8 bg-transparent"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="bg-teal-100 rounded-2xl p-8 text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-teal-600 text-sm font-medium mb-2">
                    IMAGE PLACEHOLDER
                  </div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Professional nurse caring for elderly patient in
                    comfortable home bedroom setting"
                    <br />
                    <br />
                    Search terms: home healthcare, live-in nurse, elderly care,
                    professional caregiver, home medical care, bedside nursing
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
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="h-6 w-6 text-teal-600" />
                  <h3 className="text-xl font-semibold text-slate-900">
                    Starting from GHS 200 per day
                  </h3>
                </div>
                <p className="text-slate-600">
                  Final pricing depends on specific care needs and optional
                  services selected.
                </p>
              </div>
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
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              What's Included
            </h2>
            <p className="text-xl text-slate-600">
              Comprehensive care services included in your AHENEFIE package
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {serviceCategories.map((category, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-teal-600">
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
