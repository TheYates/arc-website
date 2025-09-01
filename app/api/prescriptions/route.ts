import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

// POST /api/prescriptions - Create new prescription
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Verify user is a reviewer (only reviewers can prescribe medications)
    if (user.role !== "reviewer") {
      return NextResponse.json(
        { error: "Forbidden - Only reviewers can prescribe medications" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      patientId,
      medicationName,
      dosage,
      frequency,
      route,
      instructions,
      startDate,
      endDate,
      notes,
      monitoringRequired = false,
      monitoringInstructions,
      costEstimate,
      insuranceCovered = true,
    } = body;

    // Validate required fields
    if (!patientId || !medicationName || !dosage || !frequency || !route) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: patientId, medicationName, dosage, frequency, route",
        },
        { status: 400 }
      );
    }

    console.log('📋 Creating prescription with data:', {
      patientId,
      medicationName,
      dosage,
      frequency,
      route,
      instructions: instructions || 'No instructions provided',
      startDate,
      endDate,
      prescribedBy: user.id
    });

    // First, find or create the medication in the catalog
    let medication = await prisma.medicationCatalog.findFirst({
      where: {
        name: {
          equals: medicationName.trim(),
          mode: "insensitive",
        },
      },
    });

    // If medication doesn't exist in catalog, create it
    if (!medication) {
      console.log(`💊 Creating new medication in catalog: ${medicationName}`);
      medication = await prisma.medicationCatalog.create({
        data: {
          name: medicationName.trim(),
          category: "other",
          is_common: false,
          is_active: true,
        },
      });
    }

    // Create the prescription with separate fields for dosage, frequency, and route
    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        medicationId: medication.id,
        prescribedById: user.id,
        dosage: dosage.trim(),
        frequency,
        route,
        instructions: instructions?.trim() || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        notes: notes?.trim(),
        monitoringRequired,
        monitoringInstructions: monitoringInstructions?.trim(),
        costEstimate: costEstimate ? parseFloat(costEstimate) : null,
        insuranceCovered,
        status: "APPROVED", // Set as approved immediately for reviewers
      },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            generic_name: true,
            drug_class: true,
            route_of_administration: true,
            category: true,
            is_active: true,
          },
        },
        prescribedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        patient: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    console.log(`✅ Prescription created successfully: ${prescription.id}`);

    return NextResponse.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create prescription",
      },
      { status: 500 }
    );
  }
}

// GET /api/prescriptions - Get all prescriptions (for admin use)
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");

    // Build where clause
    let where: any = {};
    
    if (patientId) {
      where.patientId = patientId;
    }
    
    if (status) {
      where.status = status;
    }

    // If user is not admin, only show their own prescriptions or patients they have access to
    if (user.role !== "admin") {
      if (user.role === "reviewer") {
        // Reviewers can see prescriptions they created
        where.prescribedById = user.id;
      } else {
        // Other roles can only see their own patient prescriptions
        where.patientId = user.patientId || "no-access";
      }
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            generic_name: true,
            drug_class: true,
            route_of_administration: true,
            category: true,
          },
        },
        prescribedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch prescriptions",
      },
      { status: 500 }
    );
  }
}
