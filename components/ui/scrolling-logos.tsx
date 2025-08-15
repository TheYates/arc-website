"use client";

import { memo } from "react";
import Image from "next/image";

interface Logo {
  name: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface ScrollingLogosProps {
  logos: Logo[];
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right";
  className?: string;
}

const ScrollingLogos = memo(
  ({
    logos,
    speed = "normal",
    direction = "left",
    className = "",
  }: ScrollingLogosProps) => {
    const animationDuration = {
      slow: "60s",
      normal: "40s",
      fast: "20s",
    }[speed];

    return (
      <div
        className={`w-full overflow-hidden bg-gray-50 py-8 border-2 border-red-200 ${className}`}
      >
        <div className="relative">
          <div
            className="flex border border-blue-200"
            style={{
              width: "200%",
              animation: `scroll-left ${animationDuration} linear infinite`,
              animationDirection: direction === "right" ? "reverse" : "normal",
            }}
          >
            {/* First set of logos */}
            <div className="flex items-center justify-around w-1/2 px-4 bg-green-100">
              {logos.map((logo, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 mx-8 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width || 120}
                    height={logo.height || 60}
                    className="max-h-12 w-auto object-contain"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to a simple text display if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".logo-fallback")) {
                        const fallback = document.createElement("div");
                        fallback.className =
                          "logo-fallback text-xs text-gray-500 px-2 py-1 border rounded";
                        fallback.textContent = logo.name;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Duplicate set for seamless loop */}
            <div className="flex items-center justify-around w-1/2 px-4 bg-yellow-100">
              {logos.map((logo, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 mx-8 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width || 120}
                    height={logo.height || 60}
                    className="max-h-12 w-auto object-contain"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to a simple text display if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".logo-fallback")) {
                        const fallback = document.createElement("div");
                        fallback.className =
                          "logo-fallback text-xs text-gray-500 px-2 py-1 border rounded";
                        fallback.textContent = logo.name;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ScrollingLogos.displayName = "ScrollingLogos";

export { ScrollingLogos };
export type { Logo, ScrollingLogosProps };
