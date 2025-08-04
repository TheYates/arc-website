import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import {
  Shield,
  Clock,
  Baby,
  Calendar,
  AlertTriangle,
  Phone,
  Home,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const services = [
    {
      Icon: Shield,
      name: "Event Medical Coverage",
      description: "24/7 live-in home care with dedicated nursing support, emergency response, and comprehensive medical assistance.",
      href: "/services/ahenefie",
      cta: "Learn more",
      background: <img className="absolute inset-0 w-full h-full object-cover opacity-65" src="https://images.pexels.com/photos/11187364/pexels-photo-11187364.jpeg" alt="Home care" />,
      className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
      Icon: Clock,
      name: "Ahenefie",
      description: "24/7 live-in home care with dedicated nursing support, emergency response, and comprehensive medical assistance.",
      href: "/services/ahenefie",
      cta: "Learn more",
      background: <img className="absolute inset-0 w-full h-full object-cover opacity-65" src="https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg" alt="Medical visit" />,
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
      Icon: Baby,
      name: "Adamfo Pa",
      description: "Professional daily home visits with comprehensive nursing care, facility reviews, and emergency response support for your loved ones.",
      href: "/services/fie-ne-fie",
      cta: "Learn more",
      background: <img className="absolute inset-0 w-full h-full object-cover opacity-65" src="https://images.pexels.com/photos/5721555/pexels-photo-5721555.jpeg" alt="Childcare" />,
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: Calendar,
      name: "Fie Ne Fie",
      description: "Comprehensive live-in childcare with professional nanny support, basic nursing care, and emergency response capabilities for your precious little ones.",
      href: "/services/fie-ne-fie",
      cta: "Learn more",
      background: <img className="absolute inset-0 w-full h-full object-cover opacity-65" src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop&crop=center" alt="Flexible childcare" />,
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: AlertTriangle,
      name: "Yonko Pa",
      description: "Flexible childcare support with professional nanny visits scheduled when you need them most. Perfect for busy families who need reliable, on-demand childcare assistance.",
      href: "/services/yonko-pa",
      cta: "Learn more",
      background: <img className="absolute inset-0 w-full h-full object-cover opacity-65" src="https://images.pexels.com/photos/69096/pexels-photo-69096.jpeg" alt="Event medical" />,
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
  ];

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

          <BentoGrid className="lg:grid-rows-3">
            {services.map((service) => (
              <BentoCard key={service.name} {...service} />
            ))}
          </BentoGrid>
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
