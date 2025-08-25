import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    let whereClause: any = {};

    // Filter patients based on user role
    if (user.role === "caregiver") {
      // Caregivers can only see their assigned patients
      const caregiverAssignments = await prisma.caregiverAssignment.findMany({
        where: { caregiverId: user.id, isActive: true },
        select: { patientId: true },
      });

      const patientIds = caregiverAssignments.map(assignment => assignment.patientId);
      whereClause = {
        id: { in: patientIds },
      };
    } else if (user.role === "reviewer") {
      // Reviewers can only see their assigned patients
      const reviewerAssignments = await prisma.reviewerAssignment.findMany({
        where: { reviewerId: user.id, isActive: true },
        select: { patientId: true },
      });

      const patientIds = reviewerAssignments.map(assignment => assignment.patientId);
      whereClause = {
        id: { in: patientIds },
      };
    } else if (user.role === "patient") {
      // Patients can only see themselves
      whereClause = {
        userId: user.id,
      };
    }
    // Admins and super_admins can see all patients (no additional filter)

    const patients = await prisma.patient.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            createdAt: true,
          },
        },
        caregiverAssignments: {
          where: { isActive: true },
          include: {
            caregiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        reviewerAssignments: {
          where: { isActive: true },
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { user: { lastName: "asc" } },
        { user: { firstName: "asc" } },
      ],
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only admins and super_admins can create patients
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only admins can create patients" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      userId,
      dateOfBirth,
      gender,
      bloodType,
      heightCm,
      weightKg,
      careLevel,
      status,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      medicalRecordNumber,
      insuranceProvider,
      insurancePolicyNumber,
      primaryPhysician,
      allergies,
      chronicConditions,
      currentMedications,
      medicalHistory,
      specialInstructions,
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists and is not already a patient
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const existingPatient = await prisma.patient.findUnique({
      where: { userId },
    });

    if (existingPatient) {
      return NextResponse.json(
        { error: "User is already a patient" },
        { status: 400 }
      );
    }

    // Create patient record
    const patient = await prisma.patient.create({
      data: {
        userId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        bloodType,
        heightCm,
        weightKg,
        careLevel: careLevel || "MEDIUM",
        status: status || "STABLE",
        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactPhone,
        medicalRecordNumber,
        insuranceProvider,
        insurancePolicyNumber,
        primaryPhysician,
        allergies: allergies || [],
        chronicConditions: chronicConditions || [],
        currentMedications: currentMedications || [],
        medicalHistory,
        specialInstructions,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
