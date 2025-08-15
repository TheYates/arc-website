"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Shield, LogIn, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function TabletHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const serviceCategories = [
    {
      category: "Home Care Service",
      services: [
        {
          name: "Ahenefie",
          description: "Live-in home care with 24/7 nursing & emergency response",
          href: "/services/ahenefie",
        },
        {
          name: "Adamfo Pa",
          description: "Daily home visits with nursing & facility reviews",
          href: "/services/adamfo-pa",
        },
      ],
    },
    {
      category: "Nanny Service",
      services: [
        {
          name: "Fie Ne Fie",
          description: "Stay-in nanny service",
          href: "/services/fie-ne-fie",
        },
        {
          name: "Yonko Pa",
          description: "Visit-on-request nanny service",
          href: "/services/yonko-pa",
        },
      ],
    },
    {
      category: "Event Medical Services",
      services: [
        {
          name: "Event Medical Coverage",
          description: "Professional medical coverage for events & gatherings",
          href: "/services/event-medical-coverage",
        },
        {
          name: "Conference Option",
          description: "Stay-in medical support for conferences & business events",
          href: "/services/conference-option",
        },
        {
          name: "Rally Pack",
          description: "Specialized medical coverage for rallies & high-energy events",
          href: "/services/rally-pack",
        },
      ],
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Optimized for tablet portrait */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="bg-teal-600 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Alpha Rescue</span>
            </div>
          </Link>

          {/* Tablet Portrait Actions - Compact */}
          <div className="flex items-center space-x-2">
            <Link href="/get-started">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                Get Started
              </Button>
            </Link>
            
            {/* Menu Sheet */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex h-full flex-col">
                  {/* Header */}
                  <div className="flex h-16 items-center justify-between px-6 border-b">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Navigation */}
                  <div className="flex-1 overflow-auto p-6">
                    <nav className="space-y-4">
                      <Link
                        href="/"
                        className="block py-2 text-lg font-medium hover:text-teal-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Home
                      </Link>

                      {/* Services Collapsible */}
                      <Collapsible open={isServicesOpen} onOpenChange={setIsServicesOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-lg font-medium hover:text-teal-600">
                          Services
                          <ChevronDown className={`h-4 w-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 mt-2">
                          {serviceCategories.map((category) => (
                            <div key={category.category} className="space-y-2">
                              <div className="text-sm font-medium text-gray-600 px-2">
                                {category.category}
                              </div>
                              {category.services.map((service) => (
                                <Link
                                  key={service.name}
                                  href={service.href}
                                  className="block px-4 py-2 text-sm hover:bg-gray-50 rounded-md"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <div className="font-medium">{service.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {service.description}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>

                      <Link
                        href="/about"
                        className="block py-2 text-lg font-medium hover:text-teal-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        About
                      </Link>

                      <Link
                        href="/contact"
                        className="block py-2 text-lg font-medium hover:text-teal-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Contact
                      </Link>

                      <Link
                        href="/careers"
                        className="block py-2 text-lg font-medium text-teal-600 hover:text-teal-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Work With Us
                      </Link>
                    </nav>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t p-6 space-y-3">
                    <Link href="/login" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-slate-300 bg-transparent"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

// Hook to determine if we should use tablet header
export function useTabletHeader() {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Use tablet header for tablet portrait mode (768-1024px width, height > width)
  return width >= 768 && width <= 1024 && height > width;
}
