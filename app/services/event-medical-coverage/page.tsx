import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, Shield, Phone, Car, Heart, Users, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Testimonials from "@/components/testimonials";

export default function EventMedicalCoveragePage() {
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
      <section className="bg-gradient-to-br from-red-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <AlertTriangle className="h-12 w-12 text-red-600" />
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                  Event Medical Coverage
                </h1>
              </div>
              <Badge className="bg-red-100 text-red-800 mb-4">Day Option</Badge>
              <p className="text-2xl text-slate-700 mb-4">Professional Event Medical Services</p>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Comprehensive medical coverage for your events with trained medical professionals, 
                emergency response capabilities, and ambulance services to ensure participant safety.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white px-8"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-red-600 text-red-600 px-8 bg-transparent"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="bg-red-100 rounded-2xl p-8 text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-red-600 text-sm font-medium mb-2">IMAGE PLACEHOLDER</div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Medical team with ambulance at outdoor event, providing emergency care"
                    <br />
                    <br />
                    Search terms: event medical services, emergency medical team, outdoor event safety, medical tent, ambulance standby
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
                Professional Event Medical Support
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Our Event Medical Coverage provides comprehensive medical support for events of all sizes. 
                From small gatherings to large festivals, our trained medical professionals ensure participant 
                safety with immediate response capabilities and emergency transport services.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Perfect for sporting events, concerts, festivals, corporate gatherings, and any event where 
                medical safety and emergency preparedness are essential.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="h-6 w-6 text-red-600" />
                  <h3 className="text-xl font-semibold text-slate-900">
                    Starting from GHS 500 per event
                  </h3>
                </div>
                <p className="text-slate-600">
                  Pricing varies based on event size, duration, and specific requirements.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Service Overview Image */}
              <div className="bg-orange-100 rounded-2xl p-6 text-center">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="text-orange-600 text-sm font-medium mb-2">IMAGE PLACEHOLDER</div>
                  <div className="text-slate-700 text-xs leading-relaxed">
                    "Medical professionals setting up first aid station at event venue"
                    <br />
                    <br />
                    Search terms: event first aid station, medical setup, event safety preparation, medical equipment, professional medics
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
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
                    <Car className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Transport Ready
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Ambulance services and emergency transport
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Trained Team
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Certified medical professionals on-site
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Full Coverage
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Complete event duration medical support
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
              Comprehensive medical services included in your Event Medical Coverage
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {serviceCategories.map((category, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-red-600">
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
                  Sporting Events
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Marathon and running events</li>
                  <li>• Football and soccer matches</li>
                  <li>• Athletic competitions</li>
                  <li>• Cycling events and races</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Entertainment & Corporate
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Music festivals and concerts</li>
                  <li>• Corporate events and conferences</li>
                  <li>• Community festivals</li>
                  <li>• Outdoor gatherings and fairs</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-red-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Secure Medical Coverage for Your Event
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Contact us today to discuss your event medical coverage needs and ensure participant safety.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50">
                Book Event Coverage
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
            © 2024 Alpha Rescue Consult. Professional event medical services you can trust.
          </p>
        </div>
      </footer>
    </div>
  );
}
