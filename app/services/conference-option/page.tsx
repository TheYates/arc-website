import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Shield, Phone, Car, Heart, Presentation, Clock, Building } from "lucide-react";
import Link from "next/link";
import Testimonials from "@/components/testimonials";

export default function ConferenceOptionPage() {
  const serviceCategories = [
    {
      category: "Stay In",
      items: [
        "Basic nursing",
        "Vital signs monitoring",
        "Wound care management (Optional)",
        "Medication management (Optional)"
      ]
    },
    {
      category: "Emergency Response and Management",
      items: [
        "1st respondent First Aid, Stop the Bleed & BLS",
        "Secondary response (variable)",
        "Emergency ground transport (Pick & Run)",
        "ARC Ambulance (when available)",
        "National ambulance service (Stand by)"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <Presentation className="h-12 w-12 text-blue-600" />
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                  Conference Option
                </h1>
              </div>
              <Badge className="bg-blue-100 text-blue-800 mb-4">Stay In</Badge>
              <p className="text-2xl text-slate-700 mb-4">Professional Conference Medical Services</p>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Dedicated medical support for conferences and business events with on-site medical 
                professionals providing continuous care and emergency response throughout your event.
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
                  <div className="text-blue-600 text-sm font-medium mb-2">IMAGE PLACEHOLDER</div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Medical professional at conference venue with first aid station setup"
                    <br />
                    <br />
                    Search terms: conference medical services, business event healthcare, medical station, professional conference, event safety
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
                Comprehensive Conference Medical Support
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Our Conference Option provides dedicated medical professionals who stay on-site 
                throughout your conference or business event. With continuous medical presence 
                and emergency response capabilities, we ensure participant safety and peace of mind.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Perfect for multi-day conferences, corporate retreats, business summits, and 
                professional gatherings where continuous medical support is essential.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-slate-900">
                    Starting from GHS 800 per day
                  </h3>
                </div>
                <p className="text-slate-600">
                  Pricing varies based on conference duration, attendee count, and specific requirements.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Service Overview Image */}
              <div className="bg-purple-100 rounded-2xl p-6 text-center">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="text-purple-600 text-sm font-medium mb-2">IMAGE PLACEHOLDER</div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Professional conference hall with medical team monitoring attendees"
                    <br />
                    <br />
                    Search terms: conference medical monitoring, business event safety, professional healthcare, conference attendees, medical supervision
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      On-Site Presence
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Dedicated medical team throughout event
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Emergency Ready
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Immediate response to medical situations
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Professional Team
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Certified medical professionals
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Car className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Transport Ready
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Ambulance services available
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
              Comprehensive medical services included in your Conference Option package
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
                      <li key={itemIndex} className="flex items-start space-x-3">
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

      {/* Conference Types */}
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
                  Business Conferences
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Multi-day business conferences</li>
                  <li>• Corporate summits and retreats</li>
                  <li>• Professional development events</li>
                  <li>• Industry conventions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Academic & Professional
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Academic conferences and symposiums</li>
                  <li>• Medical and healthcare conferences</li>
                  <li>• Training workshops and seminars</li>
                  <li>• International conferences</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose Conference Option?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Continuous Coverage
              </h3>
              <p className="text-slate-600">
                Medical professionals stay on-site throughout your entire event
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Peace of Mind
              </h3>
              <p className="text-slate-600">
                Focus on your conference while we handle all medical concerns
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Professional Service
              </h3>
              <p className="text-slate-600">
                Discreet, professional medical support that doesn't disrupt your event
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
            Secure Medical Coverage for Your Conference
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Contact us today to discuss your conference medical coverage needs and ensure attendee safety.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Book Conference Coverage
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
            © 2024 Alpha Rescue Consult. Professional conference medical services you can trust.
          </p>
        </div>
      </footer>
    </div>
  );
}
