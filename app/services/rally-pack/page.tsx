import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Shield, Phone, Car, Heart, Users, Clock, Flag } from "lucide-react";
import Link from "next/link";
import Testimonials from "@/components/testimonials";

export default function RallyPackPage() {
  const serviceCategories = [
    {
      category: "Basic Nursing",
      items: [
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
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <Flag className="h-12 w-12 text-green-600" />
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                  Rally Pack
                </h1>
              </div>
              <Badge className="bg-green-100 text-green-800 mb-4">Day Option</Badge>
              <p className="text-2xl text-slate-700 mb-4">High-Energy Event Medical Services</p>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Specialized medical coverage for rallies, demonstrations, and high-energy events 
                with rapid response capabilities and comprehensive emergency medical support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-green-600 text-green-600 px-8 bg-transparent"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="bg-green-100 rounded-2xl p-8 text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-green-600 text-sm font-medium mb-2">IMAGE PLACEHOLDER</div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Medical team with emergency equipment at outdoor rally or demonstration"
                    <br />
                    <br />
                    Search terms: rally medical services, demonstration safety, crowd medical support, emergency response team, outdoor event medical
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
                Specialized Rally Medical Support
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Our Rally Pack is specifically designed for high-energy events, rallies, and 
                demonstrations where rapid medical response and crowd safety are paramount. 
                Our experienced medical teams are trained to handle dynamic environments and 
                provide immediate care when needed.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Perfect for political rallies, protest demonstrations, community gatherings, 
                outdoor festivals, and any high-energy event where crowd safety is essential.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-slate-900">
                    Starting from GHS 600 per event
                  </h3>
                </div>
                <p className="text-slate-600">
                  Pricing varies based on event size, duration, and crowd density.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Service Overview Image */}
              <div className="bg-emerald-100 rounded-2xl p-6 text-center">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="text-emerald-600 text-sm font-medium mb-2">IMAGE PLACEHOLDER</div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Medical professionals with portable equipment monitoring crowd at rally"
                    <br />
                    <br />
                    Search terms: crowd medical monitoring, rally safety, portable medical equipment, emergency medical response, crowd control medical
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Rapid Response
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Lightning-fast emergency medical response
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Crowd Ready
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Specialized in high-density crowd events
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Safety First
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Comprehensive safety and emergency protocols
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Car className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Mobile Ready
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Portable equipment and ambulance support
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
              Comprehensive medical services included in your Rally Pack
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {serviceCategories.map((category, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-green-600">
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

      {/* Event Types */}
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
                  Political & Social Events
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Political rallies and campaigns</li>
                  <li>• Peaceful demonstrations</li>
                  <li>• Community organizing events</li>
                  <li>• Public awareness campaigns</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  High-Energy Gatherings
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Outdoor festivals and celebrations</li>
                  <li>• Community rallies and parades</li>
                  <li>• Large outdoor gatherings</li>
                  <li>• Advocacy and awareness events</li>
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
              Why Choose Rally Pack?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Rapid Deployment
              </h3>
              <p className="text-slate-600">
                Quick setup and immediate response capabilities for dynamic events
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Crowd Expertise
              </h3>
              <p className="text-slate-600">
                Specialized experience in managing medical needs in crowd situations
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Safety Focused
              </h3>
              <p className="text-slate-600">
                Comprehensive safety protocols designed for high-energy environments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Secure Medical Coverage for Your Rally
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Contact us today to discuss your rally medical coverage needs and ensure participant safety.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                Book Rally Coverage
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
            © 2024 Alpha Rescue Consult. Professional rally medical services you can trust.
          </p>
        </div>
      </footer>
    </div>
  );
}
