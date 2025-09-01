import { NextRequest, NextResponse } from "next/server";
import {
  createPrescription,
  getAllMedications,
} from "@/lib/api/medications-prisma";
import { prisma } from "@/lib/database/postgresql";

// POST /api/medications - Create new medication prescription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      prescribedBy,
      medicationName,
      instructions,
      startDate,
      priority = "medium",
      category = "other",
    } = body;

    // Validate required fields
    if (
      !patientId ||
      !prescribedBy ||
      !medicationName
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: patientId, prescribedBy, medicationName",
        },
        { status: 400 }
      );
    }

    console.log('📋 Creating prescription with data:', {
      patientId,
      prescribedBy,
      medicationName,
      instructions: instructions || 'No instructions provided',
      startDate,
      priority,
      category
    });

    console.log('🔧 Using snake_case field names for MedicationCatalog');

    // Find or create medication in the catalog
    let medication = await prisma.medicationCatalog.findFirst({
      where: {
        name: {
          equals: medicationName.trim(),
          mode: "insensitive",
        },
        is_active: true,
      },
    });

    // If medication doesn't exist in catalog, create it
    if (!medication) {
      medication = await prisma.medicationCatalog.create({
        data: {
          name: medicationName.trim(),
          generic_name: medicationName.trim(),
          drug_class: category,
          category: category,
          dosage_forms: ["oral"],
          strength_options: ["as prescribed"],
          route_of_administration: "oral",
          is_active: true,
          is_common: false,
        },
      });
    }

    // Create prescription data
    const prescriptionData = {
      patientId,
      medicationId: medication.id,
      prescribedById: prescribedBy,
      instructions: instructions?.trim() || "",
      startDate: startDate ? new Date(startDate) : new Date(),
      notes: `Prescribed via reviewer interface. Priority: ${priority}`,
    };

    const result = await createPrescription(prescriptionData);

    if (!result) {
      throw new Error("Failed to create prescription");
    }

    // Return prescription with medication details using correct snake_case field names
    const prescriptionWithDetails = await prisma.prescription.findUnique({
      where: { id: result.id },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            generic_name: true,  // snake_case field name
            drug_class: true,    // snake_case field name
            route_of_administration: true,  // snake_case field name
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
      },
    });

    return NextResponse.json({
      success: true,
      data: prescriptionWithDetails,
    });
  } catch (error) {
    console.error("Error creating medication prescription:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create medication prescription",
      },
      { status: 500 }
    );
  }
}
