"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  showLoadingSpinner?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  quality = 85,
  placeholder = "empty",
  blurDataURL,
  objectFit = "cover",
  showLoadingSpinner = true,
  fallbackSrc,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    }
    onError?.();
  };

  const imageClasses = cn(
    objectFit === "cover" && "object-cover",
    objectFit === "contain" && "object-contain",
    objectFit === "fill" && "object-fill",
    objectFit === "none" && "object-none",
    objectFit === "scale-down" && "object-scale-down",
    "transition-opacity duration-300",
    isLoading && "opacity-0",
    !isLoading && "opacity-100",
    className
  );

  if (hasError && !fallbackSrc) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400",
          fill ? "absolute inset-0" : "w-full h-full",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Image unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", fill && "absolute inset-0")}>
      {/* Loading Spinner */}
      {isLoading && showLoadingSpinner && (
        <Skeleton
          className={cn("absolute inset-0 z-10", fill && "absolute inset-0")}
        />
      )}

      {/* Optimized Image */}
      <Image
        src={currentSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

// Hero Image Component with specific optimizations
export function HeroImage({
  src,
  alt,
  className,
  priority = true,
  quality = 90,
  ...props
}: Omit<OptimizedImageProps, "fill" | "sizes">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      priority={priority}
      quality={quality}
      className={className}
      objectFit="cover"
      {...props}
    />
  );
}

// Service Card Image Component
export function ServiceCardImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedImageProps, "fill" | "sizes">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      className={className}
      objectFit="cover"
      {...props}
    />
  );
}
