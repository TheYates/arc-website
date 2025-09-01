import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/medications/catalog - Get common medications for search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const commonOnly = searchParams.get("commonOnly") === "true";

    let medications;

    try {
      // Try to use MedicationCatalog table first
      let where: any = {
        is_active: true,
      };

      if (commonOnly) {
        where.is_common = true;
      }

      if (search && search.length > 0) {
        where.name = {
          contains: search,
          mode: "insensitive",
        };
      }

      medications = await prisma.medicationCatalog.findMany({
        where,
        select: {
          id: true,
          name: true,
          generic_name: true,
          drug_class: true,
          category: true,
          is_common: true,
        },
        orderBy: [
          { is_common: "desc" }, // Common medications first
          { name: "asc" },
        ],
        take: limit,
      });
    } catch (catalogError) {
      console.log(
        "MedicationCatalog table not found, falling back to medications table"
      );

      // No fallback needed - MedicationCatalog is the only table now
      console.log("MedicationCatalog query failed, no fallback available");
      medications = [];
    }

    // If no medications found and commonOnly was requested, return hardcoded common medications
    if (medications.length === 0 && commonOnly) {
      const commonMedicationNames = [
        "Lisinopril",
        "Metformin",
        "Amlodipine",
        "Metoprolol",
        "Omeprazole",
        "Simvastatin",
        "Losartan",
        "Albuterol",
        "Gabapentin",
        "Sertraline",
        "Ibuprofen",
        "Acetaminophen",
        "Aspirin",
        "Hydrochlorothiazide",
        "Atorvastatin",
        "Prednisone",
        "Tramadol",
        "Trazodone",
        "Clopidogrel",
        "Montelukast",
      ];

      medications = commonMedicationNames.map((name, index) => ({
        id: `common-${index}`,
        name,
        generic_name: name,
        drug_class: "Common",
        category: "Common",
        is_common: true,
      }));
    }

    return NextResponse.json({
      success: true,
      data: medications,
    });
  } catch (error) {
    console.error("Error fetching medication catalog:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch medications",
      },
      { status: 500 }
    );
  }
}

// POST /api/medications/catalog - Add new medication to catalog
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      generic_name,
      drug_class,
      category,
      dosage_forms,
      strength_options,
      route_of_administration,
      // Also accept camelCase for backward compatibility
      genericName,
      drugClass,
      dosageForms,
      strengthOptions,
      routeOfAdministration,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Medication name is required" },
        { status: 400 }
      );
    }

    // Check if medication already exists
    const existing = await prisma.medicationCatalog.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Medication already exists in catalog" },
        { status: 409 }
      );
    }

    const newMedication = await prisma.medicationCatalog.create({
      data: {
        name: name.trim(),
        generic_name: (generic_name || genericName)?.trim(),
        drug_class: (drug_class || drugClass)?.trim(),
        category: category?.trim(),
        dosage_forms: dosage_forms || dosageForms || [],
        strength_options: strength_options || strengthOptions || [],
        route_of_administration: (route_of_administration || routeOfAdministration)?.trim(),
        is_common: false, // New medications start as non-common
        is_active: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newMedication,
    });
  } catch (error) {
    console.error("Error adding medication to catalog:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add medication to catalog",
      },
      { status: 500 }
    );
  }
}
