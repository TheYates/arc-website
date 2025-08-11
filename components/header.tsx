"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, X, Shield, LogIn } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const serviceCategories = [
    {
      category: "Home Care Service",
      services: [
        {
          name: "Ahenefie",
          description:
            "Live-in home care with 24/7 nursing & emergency response",
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
          description:
            "Stay-in medical support for conferences & business events",
          href: "/services/conference-option",
        },
        {
          name: "Rally Pack",
          description:
            "Specialized medical coverage for rallies & high-energy events",
          href: "/services/rally-pack",
        },
      ],
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="bg-teal-600 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold ">Alpha Rescue Consult</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className=" hover:text-teal-600 font-medium transition-colors px-4 py-2">
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-transparent hover:text-teal-600 focus:bg-transparent focus:text-teal-600 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-transparent data-[state=open]:bg-transparent ">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[900px] p-6">
                    <div className="grid grid-cols-3 gap-8">
                      {/* First Column - Home Care Service */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold  text-sm mb-3 pb-2 border-b border-slate-200">
                            Home Care Service
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {serviceCategories[0].services.map((service) => (
                            <Link
                              key={service.name}
                              href={service.href}
                              className="block p-3 hover:bg-slate-50 transition-colors rounded-lg border border-transparent hover:border-teal-200"
                            >
                              <div className="font-medium  text-sm mb-1">
                                {service.name}
                              </div>
                              <div className="text-xs leading-tight">
                                {service.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Second Column - Nanny Service */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold  text-sm mb-3 pb-2 border-b border-slate-200">
                            Nanny Service
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {serviceCategories[1].services.map((service) => (
                            <Link
                              key={service.name}
                              href={service.href}
                              className="block p-3 hover:bg-slate-50 transition-colors rounded-lg border border-transparent hover:border-teal-200"
                            >
                              <div className="font-medium  text-sm mb-1">
                                {service.name}
                              </div>
                              <div className="text-xs  leading-tight">
                                {service.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Third Column - Event Medical Services */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold  text-sm mb-3 pb-2 border-b border-slate-200">
                            Event Medical Services
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {serviceCategories[2].services.map((service) => (
                            <Link
                              key={service.name}
                              href={service.href}
                              className="block p-3 hover:bg-slate-50 transition-colors rounded-lg border border-transparent hover:border-teal-200"
                            >
                              <div className="font-medium  text-sm mb-1">
                                {service.name}
                              </div>
                              <div className="text-xs  leading-tight">
                                {service.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className=" hover:text-teal-600 font-medium transition-colors px-4 py-2">
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/contact" legacyBehavior passHref>
                  <NavigationMenuLink className=" hover:text-teal-600 font-medium transition-colors px-4 py-2">
                    Contact
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/careers" legacyBehavior passHref>
                  <NavigationMenuLink className="text-teal-600 hover:text-black font-medium transition-colors px-4 py-2">
                    Work With Us
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/get-started">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-slate-300  hover:bg-slate-50 bg-transparent"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md  hover:text-teal-600 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="space-y-4">
              <Link
                href="/"
                className="block py-2  font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <div className="space-y-2">
                <div className="py-2  font-medium">Services</div>
                {serviceCategories.map((category) => (
                  <div key={category.category} className="space-y-1">
                    <div className="pl-2 py-1 text-sm font-medium ">
                      {category.category}
                    </div>
                    {category.services.map((service) => (
                      <Link
                        key={service.name}
                        href={service.href}
                        className="block pl-6 py-1 "
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>

              <Link
                href="/about"
                className="block py-2  font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block py-2  font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/careers"
                className="block py-2 text-teal-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Work With Us
              </Link>

              <div className="pt-4 border-t border-slate-200 space-y-3">
                <Link href="/get-started" className="block">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-slate-300  bg-transparent"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
