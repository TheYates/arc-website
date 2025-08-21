import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/lib/auth";
import { ConditionalThemeProvider } from "@/components/conditional-theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alpha Rescue Consult - Professional Home Care Services",
  description:
    "Ghana's trusted partner for professional home care and nanny services",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <AuthProvider>
          <ConditionalThemeProvider>
            {children}
            <Toaster />
          </ConditionalThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
