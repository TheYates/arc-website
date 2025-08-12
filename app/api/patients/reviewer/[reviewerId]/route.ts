import { NextRequest, NextResponse } from "next/server";
import { getPatientsByReviewer } from "@/lib/api/patients-prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reviewerId: string }> }
) {
  try {
    const { reviewerId } = await params;
    const patientsData = await getPatientsByReviewer(reviewerId);

    // Flatten the data structure to match the expected Patient interface
    const patients = patientsData.map((patient) => ({
      id: patient.id,
      userId: patient.userId,
      firstName: patient.user.firstName,
      lastName: patient.user.lastName,
      email: patient.user.email,
      phone: patient.user.phone || "",
      address: patient.address,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodType: patient.bloodType,
      heightCm: patient.heightCm,
      weightKg: patient.weightKg,
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies,
      currentMedications: patient.currentMedications,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      emergencyContactRelationship: patient.emergencyContactRelationship,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
      primaryPhysician: patient.primaryPhysician,
      careLevel: patient.careLevel,
      status: patient.status,
      specialInstructions: patient.specialInstructions,
      medicalRecordNumber: patient.medicalRecordNumber,
      chronicConditions: patient.chronicConditions,
      assignedDate: patient.assignedDate,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      // Add assignment information for the "Assigned" column
      assignedReviewer:
        patient.reviewerAssignments && patient.reviewerAssignments.length > 0
          ? {
              id: patient.reviewerAssignments[0].reviewer.id,
              name: `${patient.reviewerAssignments[0].reviewer.firstName} ${patient.reviewerAssignments[0].reviewer.lastName}`,
              assignedAt:
                patient.reviewerAssignments[0].assignedAt.toISOString(),
            }
          : undefined,
    }));

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Get patients by reviewer API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
