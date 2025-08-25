"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";

interface ConditionalThemeProviderProps {
  children: React.ReactNode;
}

export function ConditionalThemeProvider({ children }: ConditionalThemeProviderProps) {
  const pathname = usePathname();

  // Define routes that should have theme functionality (authenticated routes)
  const authenticatedRoutes = [
    '/login',
    '/change-password', 
    '/admin',
    '/reviewer',
    '/caregiver', 
    '/patient',
    '/profile',
    '/verify-email',
    '/logout'
  ];

  // Check if current path starts with any authenticated route
  const isAuthenticatedRoute = authenticatedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's an authenticated route, use ThemeProvider with theme functionality
  if (isAuthenticatedRoute) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="arc-theme"
      >
        {children}
      </ThemeProvider>
    );
  }

  // For public routes (homepage and sub-pages), force light mode by adding 'light' class to html
  React.useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('dark');
    html.classList.add('light');
    
    // Override any theme-related attributes
    html.setAttribute('data-theme', 'light');
    html.style.colorScheme = 'light';
    
    // Clean up on unmount
    return () => {
      html.classList.remove('light');
      html.removeAttribute('data-theme');
      html.style.colorScheme = '';
    };
  }, [pathname]); // Re-run when pathname changes

  // Return children without theme provider for public routes
  return <>{children}</>;
}