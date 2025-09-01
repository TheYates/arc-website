import { User } from "@/lib/auth";
import { createAuthHeaders } from "@/lib/api/auth-headers";

export interface CreateVitalSignsRequest {
  patientId: string;
  systolicBp?: string;
  diastolicBp?: string;
  heartRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
  weightKg?: string;
  bloodSugar?: string;
  notes?: string;
}

export interface VitalSignsResponse {
  id: string;
  patientId: string;
  recordedById: string;
  recordedDate: string;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  bloodSugar?: number;
  notes?: string;
}

// Get vital signs for a patient
export async function getVitalSignsClient(
  patientId: string,
  user: User | null = null
): Promise<VitalSignsResponse[]> {
  try {
    const headers = createAuthHeaders(user);
    const response = await fetch(`/api/vitals?patientId=${patientId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vitals: ${response.statusText}`);
    }

    const data = await response.json();
    return data.vitals || [];
  } catch (error) {
    console.error("Error fetching vitals:", error);
    throw error;
  }
}

// Create new vital signs
export async function createVitalSignsClient(
  vitalsData: CreateVitalSignsRequest,
  user: User | null = null
): Promise<VitalSignsResponse> {
  try {
    const headers = createAuthHeaders(user);
    const response = await fetch("/api/vitals", {
      method: "POST",
      headers,
      body: JSON.stringify(vitalsData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create vitals: ${response.statusText}`);
    }

    const data = await response.json();
    return data.vitals;
  } catch (error) {
    console.error("Error creating vitals:", error);
    throw error;
  }
}
