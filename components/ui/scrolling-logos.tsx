"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { Logo } from "@/lib/types/logos";

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
    const [isPaused, setIsPaused] = useState(false);

    // Map speed to Tailwind animation classes
    const animationClass = {
      slow: "animate-scroll-slow",
      normal: "animate-scroll",
      fast: "animate-scroll-fast",
    }[speed];

    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);

    return (
      <div
        className={`w-full overflow-hidden bg-gray-50 py-8 ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative">
          <div
            className={`flex w-[200%] ${animationClass}`}
            style={{
              animationDirection: direction === "right" ? "reverse" : "normal",
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {/* First set of logos */}
            <div className="flex items-center w-1/2">
              {logos.map((logo, index) => {
                const LogoContent = (
                  <div
                    key={`first-${index}`}
                    className="flex-shrink-0 mx-8 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 cursor-pointer"
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
                );

                return logo.url ? (
                  <a
                    key={`first-${index}`}
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    {LogoContent}
                  </a>
                ) : (
                  LogoContent
                );
              })}
            </div>

            {/* Duplicate set for seamless loop */}
            <div className="flex items-center w-1/2">
              {logos.map((logo, index) => {
                const LogoContent = (
                  <div
                    key={`second-${index}`}
                    className="flex-shrink-0 mx-8 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 cursor-pointer"
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
                );

                return logo.url ? (
                  <a
                    key={`second-${index}`}
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    {LogoContent}
                  </a>
                ) : (
                  LogoContent
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ScrollingLogos.displayName = "ScrollingLogos";

export { ScrollingLogos };
export type { ScrollingLogosProps };
