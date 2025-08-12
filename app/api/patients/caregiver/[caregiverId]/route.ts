import { NextRequest, NextResponse } from "next/server";
import { getPatientsByCaregiver } from "@/lib/api/patients-prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caregiverId: string }> }
) {
  try {
    const { caregiverId } = await params;
    const patientsData = await getPatientsByCaregiver(caregiverId);

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
      assignedCaregiver:
        patient.caregiverAssignments && patient.caregiverAssignments.length > 0
          ? {
              id: patient.caregiverAssignments[0].caregiver.id,
              name: `${patient.caregiverAssignments[0].caregiver.firstName} ${patient.caregiverAssignments[0].caregiver.lastName}`,
              assignedAt:
                patient.caregiverAssignments[0].assignedAt.toISOString(),
            }
          : undefined,
    }));

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Get patients by caregiver API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
