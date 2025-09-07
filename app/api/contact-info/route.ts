import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";

export async function GET() {
  try {
    // Get contact information (public endpoint, no auth required)
    const contactInfo = await prisma.contactInfo.findFirst();

    // If no contact info exists, return default values
    const defaultContactInfo = {
      primaryPhone: "+233 XX XXX XXXX",
      email: "info@alpharescue.com",
      address: "Accra, Ghana",
      supportHours: "Mon-Fri, 8AM-6PM",
    };

    return NextResponse.json({
      contactInfo: contactInfo || defaultContactInfo,
    });
  } catch (error) {
    console.error("Error in contact info GET:", error);
    
    // Return default values on error
    return NextResponse.json({
      contactInfo: {
        primaryPhone: "+233 XX XXX XXXX",
        email: "info@alpharescue.com",
        address: "Accra, Ghana",
        supportHours: "Mon-Fri, 8AM-6PM",
      },
    });
  }
}
