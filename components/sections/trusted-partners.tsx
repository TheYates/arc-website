"use client";

import { useState, useEffect } from "react";
import { ScrollingLogos } from "@/components/ui/scrolling-logos";
import { getPartnerLogos, fetchPartnerLogos } from "@/lib/constants/logos";
import { Logo } from "@/lib/types/logos";

export function TrustedPartners() {
  const [partnerLogos, setPartnerLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogos = async () => {
      try {
        const logos = await fetchPartnerLogos();
        setPartnerLogos(logos);
      } catch (error) {
        console.error("Failed to load partner logos:", error);
        // Fallback to static logos
        setPartnerLogos(getPartnerLogos());
      } finally {
        setIsLoading(false);
      }
    };

    loadLogos();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Trusted by Leading Organizations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're proud to partner with these organizations to provide
              exceptional care services across Ghana.
            </p>
          </div>
        </div>
        <div className="w-full overflow-hidden bg-gray-50 py-8">
          <div className="animate-pulse flex space-x-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-24 bg-gray-200 rounded flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Trusted by Leading Organizations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're proud to partner with these organizations to provide
            exceptional care services across Ghana.
          </p>
        </div>
      </div>

      <ScrollingLogos
        logos={partnerLogos}
        speed="normal"
        direction="left"
        className="mt-8"
      />
    </section>
  );
}

// Alternative version with different styling
export function TrustedPartnersMinimal() {
  const [partnerLogos, setPartnerLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogos = async () => {
      try {
        const logos = await fetchPartnerLogos();
        setPartnerLogos(logos);
      } catch (error) {
        console.error("Failed to load partner logos:", error);
        // Fallback to static logos
        setPartnerLogos(getPartnerLogos());
      } finally {
        setIsLoading(false);
      }
    };

    loadLogos();
  }, []);

  if (isLoading) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Trusted by Leading Organizations
          </p>
        </div>
        <div className="w-full overflow-hidden bg-gray-50 py-8">
          <div className="animate-pulse flex space-x-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-24 bg-gray-200 rounded flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Trusted by Leading Organizations
        </p>
      </div>

      <ScrollingLogos
        logos={partnerLogos}
        speed="fast"
        direction="left"
        className="bg-gray-50"
      />
    </section>
  );
}
