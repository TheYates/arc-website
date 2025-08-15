"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import TabletHeader from "@/components/tablet-header";

export default function ResponsiveHeader() {
  const [isTabletPortrait, setIsTabletPortrait] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Tablet portrait: width 768-1024px and height > width
      const isTabletPortraitMode = width >= 768 && width <= 1024 && height > width;
      setIsTabletPortrait(isTabletPortraitMode);
    };

    // Initial check
    checkOrientation();

    // Listen for resize and orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      // Delay to allow orientation change to complete
      setTimeout(checkOrientation, 100);
    });

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <Header />; // Default to regular header during SSR
  }

  // Use tablet header for tablet portrait mode
  if (isTabletPortrait) {
    return <TabletHeader />;
  }

  // Use regular header for all other cases
  return <Header />;
}
