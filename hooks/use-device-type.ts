import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

interface DeviceInfo {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export function useDeviceType(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceType: "desktop",
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1024,
    height: 768,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let deviceType: DeviceType = "desktop";
      
      // Define breakpoints
      // Mobile: < 768px
      // Tablet: 768px - 1024px
      // Desktop: > 1024px
      if (width < 768) {
        deviceType = "mobile";
      } else if (width >= 768 && width <= 1024) {
        deviceType = "tablet";
      } else {
        deviceType = "desktop";
      }

      setDeviceInfo({
        deviceType,
        isMobile: deviceType === "mobile",
        isTablet: deviceType === "tablet",
        isDesktop: deviceType === "desktop",
        width,
        height,
      });
    };

    // Initial check
    updateDeviceInfo();

    // Add event listener
    window.addEventListener("resize", updateDeviceInfo);

    // Cleanup
    return () => window.removeEventListener("resize", updateDeviceInfo);
  }, []);

  return deviceInfo;
}

// Hook for responsive breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<string>("lg");

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setBreakpoint("sm");
      } else if (width < 768) {
        setBreakpoint("md");
      } else if (width < 1024) {
        setBreakpoint("lg");
      } else if (width < 1280) {
        setBreakpoint("xl");
      } else {
        setBreakpoint("2xl");
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}

// Hook for tablet-specific optimizations
export function useTabletOptimizations() {
  const { isTablet, width } = useDeviceType();
  
  return {
    isTablet,
    // Tablet-specific configurations
    gridCols: isTablet ? (width > 900 ? 2 : 1) : 3,
    cardPadding: isTablet ? "p-4" : "p-6",
    fontSize: isTablet ? "text-sm" : "text-base",
    spacing: isTablet ? "space-y-4" : "space-y-6",
    buttonSize: isTablet ? "sm" : "default",
    showSidebar: !isTablet, // Hide sidebar on tablets, use bottom nav instead
  };
}
