import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/medications/catalog - Get common medications for search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const commonOnly = searchParams.get('commonOnly') === 'true';

    let where: any = {
      isActive: true
    };

    if (commonOnly) {
      where.isCommon = true;
    }

    if (search && search.length > 0) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const medications = await prisma.medicationCatalog.findMany({
      where,
      select: {
        id: true,
        name: true,
        genericName: true,
        drugClass: true,
        category: true,
        isCommon: true
      },
      orderBy: [
        { isCommon: 'desc' }, // Common medications first
        { name: 'asc' }
      ],
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: medications
    });

  } catch (error) {
    console.error('Error fetching medication catalog:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch medications' 
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
      genericName, 
      drugClass, 
      category,
      dosageForms,
      strengthOptions,
      routeOfAdministration
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Medication name is required' },
        { status: 400 }
      );
    }

    // Check if medication already exists
    const existing = await prisma.medicationCatalog.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Medication already exists in catalog' },
        { status: 409 }
      );
    }

    const newMedication = await prisma.medicationCatalog.create({
      data: {
        name: name.trim(),
        genericName: genericName?.trim(),
        drugClass: drugClass?.trim(),
        category: category?.trim(),
        dosageForms: dosageForms || [],
        strengthOptions: strengthOptions || [],
        routeOfAdministration: routeOfAdministration?.trim(),
        contraindications: [],
        sideEffects: [],
        drugInteractions: [],
        isCommon: false, // New medications start as non-common
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: newMedication
    });

  } catch (error) {
    console.error('Error adding medication to catalog:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add medication to catalog' 
      },
      { status: 500 }
    );
  }
}
