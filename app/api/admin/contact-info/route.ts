import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";
import { validatePhoneNumbers } from "@/lib/utils/phone-validation";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get contact information
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { primaryPhone, secondaryPhone, email, address, supportHours } = body;

    // Validate required fields
    if (!primaryPhone || !email || !address || !supportHours) {
      return NextResponse.json(
        { error: "Primary phone, email, address, and support hours are required" },
        { status: 400 }
      );
    }

    // Validate phone numbers
    const phoneValidation = validatePhoneNumbers(primaryPhone, secondaryPhone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Check if contact info already exists
    const existingInfo = await prisma.contactInfo.findFirst();

    let result;
    if (existingInfo) {
      // Update existing record
      result = await prisma.contactInfo.update({
        where: { id: existingInfo.id },
        data: {
          primaryPhone: phoneValidation.formattedPrimary!,
          secondaryPhone: phoneValidation.formattedSecondary || null,
          email,
          address,
          supportHours,
        },
      });
    } else {
      // Create new record
      result = await prisma.contactInfo.create({
        data: {
          primaryPhone: phoneValidation.formattedPrimary!,
          secondaryPhone: phoneValidation.formattedSecondary || null,
          email,
          address,
          supportHours,
        },
      });
    }

    return NextResponse.json({
      message: "Contact information saved successfully",
      contactInfo: {
        id: result.id,
        primaryPhone: result.primaryPhone,
        secondaryPhone: result.secondaryPhone,
        email: result.email,
        address: result.address,
        supportHours: result.supportHours,
        updatedAt: result.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in contact info PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
