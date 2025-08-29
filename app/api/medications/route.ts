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
      dosage,
      frequency,
      route,
      startDate,
      endDate,
      instructions,
      priority = "medium",
      category = "other",
    } = body;

    // Validate required fields
    if (
      !patientId ||
      !prescribedBy ||
      !medicationName ||
      !dosage ||
      !frequency
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: patientId, prescribedBy, medicationName, dosage, frequency",
        },
        { status: 400 }
      );
    }

    // Find or create medication in the catalog
    let medication = await prisma.medication.findFirst({
      where: {
        name: {
          equals: medicationName.trim(),
          mode: "insensitive",
        },
      },
    });

    // If medication doesn't exist in catalog, create it
    if (!medication) {
      medication = await prisma.medication.create({
        data: {
          name: medicationName.trim(),
          genericName: medicationName.trim(),
          drugClass: category,
          dosageForms: [route || "oral"],
          strengthOptions: [dosage],
          routeOfAdministration: route || "oral",
          contraindications: [],
          sideEffects: [],
          drugInteractions: [],
        },
      });
    }

    // Create prescription data
    const prescriptionData = {
      patientId,
      medicationId: medication.id,
      prescribedById: prescribedBy,
      dosage: dosage.trim(),
      frequency,
      duration: endDate
        ? `${Math.ceil(
            (new Date(endDate).getTime() -
              new Date(startDate || Date.now()).getTime()) /
              (1000 * 60 * 60 * 24)
          )}`
        : undefined,
      instructions: instructions?.trim(),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      notes: `Prescribed via reviewer interface. Priority: ${priority}`,
    };

    const result = await createPrescription(prescriptionData);

    if (!result) {
      throw new Error("Failed to create prescription");
    }

    // Return prescription with medication details
    const prescriptionWithDetails = await prisma.prescription.findUnique({
      where: { id: result.id },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            genericName: true,
            drugClass: true,
            routeOfAdministration: true,
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
