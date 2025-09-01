import { NextRequest, NextResponse } from "next/server";
import { createVitalSigns, getVitalSignsByPatientId } from "@/lib/api/vitals-prisma";
import { authenticateRequest } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId is required" },
        { status: 400 }
      );
    }

    const vitals = await getVitalSignsByPatientId(patientId);
    return NextResponse.json({ vitals });
  } catch (error) {
    console.error("Get vitals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vitals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      patientId,
      systolicBp,
      diastolicBp,
      heartRate,
      temperature,
      oxygenSaturation,
      weightKg,
      bloodSugar,
      notes,
    } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId is required" },
        { status: 400 }
      );
    }

    const vitalsData = {
      patientId,
      recordedById: user.id,
      systolicBp: systolicBp ? parseInt(systolicBp) : undefined,
      diastolicBp: diastolicBp ? parseInt(diastolicBp) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : undefined,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      bloodSugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
      notes: notes || undefined,
    };

    const savedVitals = await createVitalSigns(vitalsData);
    
    if (!savedVitals) {
      return NextResponse.json(
        { error: "Failed to create vital signs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ vitals: savedVitals });
  } catch (error) {
    console.error("Create vitals error:", error);
    return NextResponse.json(
      { error: "Failed to create vitals" },
      { status: 500 }
    );
  }
}
