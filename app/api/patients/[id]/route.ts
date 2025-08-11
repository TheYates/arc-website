import { NextRequest, NextResponse } from "next/server";
import { getPatientById } from "@/lib/api/patients-prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const start = performance.now();
    const { id } = await params;
    console.log('🔍 Looking for patient with ID:', id);

    const dbStart = performance.now();
    const patientData = await getPatientById(id);
    const dbEnd = performance.now();
    console.log(`📊 Patient DB query took ${(dbEnd - dbStart).toFixed(2)}ms, result: ${patientData ? 'Found' : 'Not found'}`);

    if (!patientData) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Flatten the data structure to match the expected Patient interface
    const patient = {
      id: patientData.id,
      userId: patientData.userId,
      firstName: patientData.user.firstName,
      lastName: patientData.user.lastName,
      email: patientData.user.email,
      phone: patientData.user.phone || '',
      address: patientData.address,
      dateOfBirth: patientData.dateOfBirth,
      gender: patientData.gender,
      bloodType: patientData.bloodType,
      heightCm: patientData.heightCm,
      weightKg: patientData.weightKg,
      medicalHistory: patientData.medicalHistory,
      allergies: patientData.allergies,
      currentMedications: patientData.currentMedications,
      emergencyContactName: patientData.emergencyContactName,
      emergencyContactPhone: patientData.emergencyContactPhone,
      emergencyContactRelationship: patientData.emergencyContactRelationship,
      insuranceProvider: patientData.insuranceProvider,
      insurancePolicyNumber: patientData.insurancePolicyNumber,
      primaryPhysician: patientData.primaryPhysician,
      careLevel: patientData.careLevel,
      status: patientData.status,
      specialInstructions: patientData.specialInstructions,
      medicalRecordNumber: patientData.medicalRecordNumber,
      chronicConditions: patientData.chronicConditions,
      assignedDate: patientData.assignedDate,
      createdAt: patientData.createdAt,
      updatedAt: patientData.updatedAt,
    };

    const total = performance.now();
    console.log(`👤 Patient API total time: ${(total - start).toFixed(2)}ms`);

    return NextResponse.json({ patient });
  } catch (error) {
    console.error("Get patient API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
