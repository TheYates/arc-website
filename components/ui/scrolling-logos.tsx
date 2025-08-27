"use client";

import { memo, useState } from "react";
import Image from "next/image";

interface Logo {
  name: string;
  src: string;
  alt: string;
  url?: string;
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
    const [isPaused, setIsPaused] = useState(false);

    const animationDuration = {
      slow: "60s",
      normal: "40s",
      fast: "20s",
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
            className="flex"
            style={{
              width: "200%",
              animation: `scroll-left ${animationDuration} linear infinite`,
              animationDirection: direction === "right" ? "reverse" : "normal",
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {/* First set of logos */}
            <div className="flex items-center justify-around w-1/2 px-4">
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
            <div className="flex items-center justify-around w-1/2 px-4">
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
export type { Logo, ScrollingLogosProps };
