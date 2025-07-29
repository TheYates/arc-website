import { Patient, Medication, MedicationAdministration, User } from "@/lib/types";

// Client-side API functions that call Next.js API routes

// Authentication
export async function authenticateUserClient(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Patients
export async function getPatientByIdClient(patientId: string): Promise<Patient | null> {
  try {
    const response = await fetch(`/api/patients/${patientId}`);
    
    if (!response.ok) {
      console.error('Failed to fetch patient:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.patient;
  } catch (error) {
    console.error('Get patient error:', error);
    return null;
  }
}

export async function getPatientsByCaregiverClient(caregiverId: string): Promise<Patient[]> {
  try {
    const response = await fetch(`/api/patients/caregiver/${caregiverId}`);
    
    if (!response.ok) {
      console.error('Failed to fetch patients:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.patients;
  } catch (error) {
    console.error('Get patients by caregiver error:', error);
    return [];
  }
}

// Medications
export async function getMedicationsClient(patientId: string): Promise<Medication[]> {
  try {
    const response = await fetch(`/api/medications/${patientId}`);
    
    if (!response.ok) {
      console.error('Failed to fetch medications:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.medications;
  } catch (error) {
    console.error('Get medications error:', error);
    return [];
  }
}

export async function getMedicationAdministrationsClient(patientId: string): Promise<MedicationAdministration[]> {
  try {
    const response = await fetch(`/api/medications/administrations/${patientId}`);
    
    if (!response.ok) {
      console.error('Failed to fetch administrations:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.administrations;
  } catch (error) {
    console.error('Get administrations error:', error);
    return [];
  }
}

export async function recordMedicationAdministrationClient(
  administration: Omit<MedicationAdministration, "id">
): Promise<MedicationAdministration | null> {
  try {
    const response = await fetch('/api/medications/administrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(administration),
    });

    if (!response.ok) {
      console.error('Failed to record administration:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.administration;
  } catch (error) {
    console.error('Record administration error:', error);
    return null;
  }
}
