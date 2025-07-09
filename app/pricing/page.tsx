"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import Header from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPackageDisplayConfigs } from "@/lib/api/packages";
import { PackageDisplayConfig } from "@/lib/types/packages";

export default function PricingPage() {
  const [packages, setPackages] = useState<PackageDisplayConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const frequencies = [
    { value: "daily", label: "Daily Rate", priceSuffix: "/day" },
    { value: "monthly", label: "Monthly Rate", priceSuffix: "/month" },
  ];

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      const packageConfigs = await getPackageDisplayConfigs();
      setPackages(packageConfigs);
    } catch (err) {
      setError("Failed to load package information");
      console.error("Error loading packages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Group packages by category
  const homeCareTiers = packages.filter((pkg) => pkg.category === "home_care");
  const nannyTiers = packages.filter((pkg) => pkg.category === "nanny");

  const eventTiers = [
    {
      name: "Event Medical Coverage",
      id: "tier-event-medical",
      href: "/get-started",
      price: { daily: "GHS 500", monthly: "GHS 14,000" },
      description:
        "Comprehensive medical coverage for events, conferences, and gatherings.",
      features: [
        "On-site medical team",
        "Emergency response protocols",
        "First aid stations",
        "Ambulance coordination",
        "Event safety planning",
      ],
      mostPopular: false,
    },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  const [frequency, setFrequency] = useState(frequencies[0]);

  return (
    <div className="bg-white">
      <Header />

      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-teal-600">
              Pricing
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Transparent Pricing for Quality Care
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
            Choose the perfect care package for your family. Professional
            healthcare and childcare services designed to give you peace of
            mind.
          </p>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading pricing information...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-800 mb-4">{error}</p>
                <Button
                  onClick={loadPackages}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <div>
              <div className="mt-16 flex justify-center">
                <div className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200 bg-gray-50">
                  {frequencies.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFrequency(option)}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        frequency.value === option.value
                          ? "bg-teal-600 text-white"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Home Care Services */}
              <div className="mt-16">
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Home Care Services
                  </h3>
                  <p className="text-lg text-gray-600">
                    Professional medical care in the comfort of your home
                  </p>
                </div>
                <div className="grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 mx-auto">
                  {homeCareTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={classNames(
                        tier.mostPopular
                          ? "ring-2 ring-teal-600"
                          : "ring-1 ring-gray-200",
                        "rounded-3xl p-8"
                      )}
                    >
                      {tier.mostPopular && (
                        <p className="text-sm font-semibold leading-6 text-teal-600 mb-4">
                          Most Popular
                        </p>
                      )}
                      <h3
                        id={tier.id}
                        className={classNames(
                          tier.mostPopular ? "text-teal-600" : "text-gray-900",
                          "text-lg font-semibold leading-8"
                        )}
                      >
                        {tier.name}
                      </h3>
                      <p className="mt-4 text-sm leading-6 text-gray-600">
                        {tier.description}
                      </p>
                      <p className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-gray-900">
                          {
                            tier.price[
                              frequency.value as keyof typeof tier.price
                            ]
                          }
                        </span>
                        <span className="text-sm font-semibold leading-6 text-gray-600">
                          {frequency.priceSuffix}
                        </span>
                      </p>
                      <Link
                        href={tier.href}
                        className={classNames(
                          tier.mostPopular
                            ? "bg-teal-600 text-white shadow-sm hover:bg-teal-500"
                            : "text-teal-600 ring-1 ring-inset ring-teal-200 hover:ring-teal-300",
                          "mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                        )}
                      >
                        Choose {tier.name}
                      </Link>
                      <ul
                        role="list"
                        className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                      >
                        {/* Standard Services */}
                        {tier.standardServices.map((feature) => (
                          <li key={feature} className="flex gap-x-3">
                            <Check
                              aria-hidden="true"
                              className="h-5 w-5 flex-none text-teal-600"
                            />
                            {feature}
                          </li>
                        ))}

                        {/* Optional Services */}
                        {tier.optionalServices.length > 0 && (
                          <>
                            <li className="mt-6 pt-3 border-t border-gray-200">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Optional Add-ons
                              </span>
                            </li>
                            {tier.optionalServices.map((service) => (
                              <li key={service.name} className="flex gap-x-3">
                                <Check
                                  aria-hidden="true"
                                  className="h-5 w-5 flex-none text-orange-500"
                                />
                                <div className="flex-1">
                                  <span>{service.name}</span>
                                  {service.price[
                                    frequency.value as keyof typeof service.price
                                  ] && (
                                    <span className="ml-2 text-xs font-medium text-orange-600">
                                      +
                                      {
                                        service.price[
                                          frequency.value as keyof typeof service.price
                                        ]
                                      }
                                      {frequency.priceSuffix}
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nanny Services */}
              <div className="mt-20">
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Nanny Services
                  </h3>
                  <p className="text-lg text-gray-600">
                    Professional childcare and educational support
                  </p>
                </div>
                <div className="grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 mx-auto">
                  {nannyTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={classNames(
                        tier.mostPopular
                          ? "ring-2 ring-teal-600"
                          : "ring-1 ring-gray-200",
                        "rounded-3xl p-8"
                      )}
                    >
                      {tier.mostPopular && (
                        <p className="text-sm font-semibold leading-6 text-teal-600 mb-4">
                          Most Popular
                        </p>
                      )}
                      <h3
                        id={tier.id}
                        className={classNames(
                          tier.mostPopular ? "text-teal-600" : "text-gray-900",
                          "text-lg font-semibold leading-8"
                        )}
                      >
                        {tier.name}
                      </h3>
                      <p className="mt-4 text-sm leading-6 text-gray-600">
                        {tier.description}
                      </p>
                      <p className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-gray-900">
                          {
                            tier.price[
                              frequency.value as keyof typeof tier.price
                            ]
                          }
                        </span>
                        <span className="text-sm font-semibold leading-6 text-gray-600">
                          {frequency.priceSuffix}
                        </span>
                      </p>
                      <Link
                        href={tier.href}
                        className={classNames(
                          tier.mostPopular
                            ? "bg-teal-600 text-white shadow-sm hover:bg-teal-500"
                            : "text-teal-600 ring-1 ring-inset ring-teal-200 hover:ring-teal-300",
                          "mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                        )}
                      >
                        Choose {tier.name}
                      </Link>
                      <ul
                        role="list"
                        className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                      >
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex gap-x-3">
                            <Check
                              aria-hidden="true"
                              className="h-5 w-5 flex-none text-teal-600"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Medical Services */}
              <div className="mt-20">
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Event Medical Services
                  </h3>
                  <p className="text-lg text-gray-600">
                    Professional medical coverage for events and gatherings
                  </p>
                </div>
                <div className="grid max-w-sm grid-cols-1 mx-auto">
                  {eventTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={classNames(
                        tier.mostPopular
                          ? "ring-2 ring-teal-600"
                          : "ring-1 ring-gray-200",
                        "rounded-3xl p-8"
                      )}
                    >
                      {tier.mostPopular && (
                        <p className="text-sm font-semibold leading-6 text-teal-600 mb-4">
                          Most Popular
                        </p>
                      )}
                      <h3
                        id={tier.id}
                        className={classNames(
                          tier.mostPopular ? "text-teal-600" : "text-gray-900",
                          "text-lg font-semibold leading-8"
                        )}
                      >
                        {tier.name}
                      </h3>
                      <p className="mt-4 text-sm leading-6 text-gray-600">
                        {tier.description}
                      </p>
                      <p className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-gray-900">
                          {
                            tier.price[
                              frequency.value as keyof typeof tier.price
                            ]
                          }
                        </span>
                        <span className="text-sm font-semibold leading-6 text-gray-600">
                          {frequency.priceSuffix}
                        </span>
                      </p>
                      <Link
                        href={tier.href}
                        className={classNames(
                          tier.mostPopular
                            ? "bg-teal-600 text-white shadow-sm hover:bg-teal-500"
                            : "text-teal-600 ring-1 ring-inset ring-teal-200 hover:ring-teal-300",
                          "mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                        )}
                      >
                        Choose {tier.name}
                      </Link>
                      <ul
                        role="list"
                        className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                      >
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex gap-x-3">
                            <Check
                              aria-hidden="true"
                              className="h-5 w-5 flex-none text-teal-600"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              {/* Additional Info */}
              <section className="bg-slate-50 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                      Need a Custom Package?
                    </h2>
                    <p className="text-xl text-slate-600">
                      Every family is unique. Contact us to discuss your
                      specific needs and get a personalized quote.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact">
                      <Button
                        size="lg"
                        className="bg-teal-600 hover:bg-teal-700 text-white px-8"
                      >
                        Get Custom Quote
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-teal-600 text-teal-600 px-8 bg-transparent"
                      >
                        Schedule Consultation
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
