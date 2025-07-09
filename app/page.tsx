import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Clock,
  Baby,
  Calendar,
  ArrowRight,
  AlertTriangle,
  Users,
  Flag,
  Phone,
  Home,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold  mb-6">
                Professional Home Care & Nanny Services in Ghana
              </h1>
              <p className="text-xl mb-8 leading-relaxed">
                We provide compassionate, professional care services tailored to
                your family's unique needs across Ghana.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3"
                  >
                    Get Started Today
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-teal-600 text-teal-600 px-8 py-3 bg-transparent"
                  >
                    View Pricing
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
                    "Happy Ghanaian family with professional caregiver in modern
                    home setting"
                    <br />
                    <br />
                    Search terms: Ghanaian family, professional caregiver, home
                    healthcare, happy family, African healthcare, family care
                    services
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold  mb-4">
              Our Care Services
            </h2>
            <p className="text-xl  max-w-3xl mx-auto">
              Choose from our comprehensive range of home care and nanny
              services, designed to provide peace of mind for your family.
            </p>
          </div>

          {/* Home Care Service */}
          <div className="bg-white dark:bg-black mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold  mb-2">
                Home Care Service
              </h3>
              <p className="text-lg">
                Professional medical care and support in the comfort of your
                home
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Ahenefie */}
              <Card className="bg-white dark:bg-black hover:shadow-lg transition-shadow border-l-4 border-l-teal-500">
                <CardContent className="p-6">
                  <div className="bg-teal-100 p-3 rounded-lg w-fit mb-4">
                    <Shield className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold  mb-2">AHENEFIE</h3>
                  <p className=" mb-4">
                    24/7 live-in home care with dedicated nursing support,
                    emergency response, and comprehensive medical assistance.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-teal-600 font-medium">
                      Starting from GHS 150/day
                    </p>
                    <Link href="/services/ahenefie">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-teal-600 text-teal-600"
                      >
                        Learn More <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Adamfo Pa */}
              <Card className="bg-white dark:bg-black hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold  mb-2">ADAMFO PA</h3>
                  <p className="mb-4">
                    Professional daily home visits with flexible scheduling for
                    regular medical support and health monitoring.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-blue-600 font-medium">
                      Starting from GHS 80/visit
                    </p>
                    <Link href="/services/adamfo-pa">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-600"
                      >
                        Learn More <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Nanny Service */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold  mb-2">
                Nanny Service
              </h3>
              <p className="text-lg ">
                Professional childcare and nanny services for your family
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Fie Ne Fie */}
              <Card className="bg-white dark:bg-black hover:shadow-lg transition-shadow border-l-4 border-l-pink-500">
                <CardContent className="p-6">
                  <div className="bg-pink-100 p-3 rounded-lg w-fit mb-4">
                    <Baby className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold  mb-2">FIE NE FIE</h3>
                  <p className=" mb-4">
                    Live-in nanny service with professional childcare,
                    educational support, and emergency response capabilities.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-pink-600 font-medium">
                      Starting from GHS 120/day
                    </p>
                    <Link href="/services/fie-ne-fie">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-pink-600 text-pink-600"
                      >
                        Learn More <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Yonko Pa */}
              <Card className="bg-white dark:bg-black hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500">
                <CardContent className="p-6">
                  <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold  mb-2">YONKO PA</h3>
                  <p className=" mb-4">
                    Flexible on-demand nanny service with professional childcare
                    and educational support when you need it.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-indigo-600 font-medium">
                      Starting from GHS 60/visit
                    </p>
                    <Link href="/services/yonko-pa">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-indigo-600 text-indigo-600"
                      >
                        Learn More <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Event Medical Services */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold  mb-2">
                Event Medical Services
              </h3>
              <p className="text-lg ">
                Professional medical coverage for events, conferences, and
                gatherings
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Event Medical Coverage */}
              <Card className="bg-white dark:bg-black hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="bg-red-100 p-3 rounded-lg w-fit mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold  mb-2">
                    Event Medical Coverage
                  </h3>
                  <p className=" mb-4">
                    Comprehensive medical coverage for sporting events,
                    concerts, festivals, and corporate gatherings with emergency
                    response capabilities.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-red-600 font-medium">
                      Starting from GHS 500/event
                    </p>
                    <Link href="/services/event-medical-coverage">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-600"
                      >
                        Learn More <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Conference Option */}
              <Card className="bg-white dark:bg-black hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold  mb-2">
                    Conference Option
                  </h3>
                  <p className=" mb-4">
                    Dedicated stay-in medical support for conferences and
                    business events with continuous on-site medical presence.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-blue-600 font-medium">
                      Starting from GHS 800/day
                    </p>
                    <Link href="/services/conference-option">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-600"
                      >
                        Learn More <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Rally Pack */}
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                    <Flag className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold  mb-2">Rally Pack</h3>
                  <p className=" mb-4">
                    Specialized medical coverage for rallies, demonstrations,
                    and high-energy events with rapid response capabilities.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-green-600 font-medium">
                      Starting from GHS 600/event
                    </p>
                    <Link href="/services/rally-pack">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-600"
                      >
                        Learn More <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold  mb-4">
              How It Works
            </h2>
            <p className="text-xl  max-w-3xl mx-auto">
              Getting started with our care services is simple and
              straightforward. Here's how we make it easy for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-12 h-12 mx-auto mb-6 flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold  mb-4">Book Consultation</h3>
              <p className=" mb-4">
                Contact us for a free consultation to discuss your specific care
                needs and preferences.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <Phone className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Call or book online</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-12 h-12 mx-auto mb-6 flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold  mb-4">Care Assessment</h3>
              <p className=" mb-4">
                Our team conducts a thorough assessment to create a personalized
                care plan for you.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <UserCheck className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  Professional evaluation
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-12 h-12 mx-auto mb-6 flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold  mb-4">Start Care</h3>
              <p className=" mb-4">
                Begin receiving professional care services tailored to your
                family's unique needs.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <Home className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Care begins at home</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/get-started">
              <Button
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3"
              >
                Start Your Care Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-teal-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Experience professional care services designed for your family's
            needs.
          </p>
          <Link href="/get-started">
            <Button
              size="lg"
              className="bg-white text-teal-600 hover:bg-slate-100 px-8 py-3"
            >
              Book Your Consultation
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Alpha Rescue Consult</h3>
              <p className="text-slate-300 mb-4">
                Professional home care and nanny services across Ghana.
                Providing compassionate, reliable care for your family.
              </p>
              <div className="flex space-x-4">
                <Phone className="h-5 w-5 text-teal-400" />
                <span className="text-slate-300">+233 XX XXX XXXX</span>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link
                    href="/services/ahenefie"
                    className="hover:text-teal-400"
                  >
                    AHENEFIE
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/adamfo-pa"
                    className="hover:text-teal-400"
                  >
                    ADAMFO PA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/fie-ne-fie"
                    className="hover:text-teal-400"
                  >
                    FIE NE FIE
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/yonko-pa"
                    className="hover:text-teal-400"
                  >
                    YONKO PA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/event-medical"
                    className="hover:text-teal-400"
                  >
                    Event Medical
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link href="/about" className="hover:text-teal-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-teal-400">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-teal-400">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/get-started" className="hover:text-teal-400">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Alpha Rescue Consult. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
