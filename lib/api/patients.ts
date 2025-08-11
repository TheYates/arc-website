import { Patient } from "../types/patients";
import { getApplicationById } from "./applications";

// API-based patient functions using Neon DB

export async function getPatients(): Promise<Patient[]> {
  try {
    const response = await fetch('/api/admin/patients');
    if (!response.ok) {
      throw new Error('Failed to fetch patients');
    }
    const data = await response.json();
    return data.patients || [];
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}

export async function getPatientById(id: string): Promise<Patient | null> {
  try {
    const response = await fetch(`/api/admin/patients/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch patient');
    }
    const data = await response.json();
    return data.patient || null;
  } catch (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
}

export async function getPatientByApplicationId(applicationId: string): Promise<Patient | null> {
  try {
    // For now, we'll get all patients and filter by applicationId
    // In a real app, you might want a dedicated endpoint for this
    const patients = await getPatients();
    return patients.find((patient) => patient.applicationId === applicationId) || null;
  } catch (error) {
    console.error('Error fetching patient by application ID:', error);
    return null;
  }
}

export async function createPatient(patientData: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient | null> {
  try {
    const response = await fetch('/api/admin/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create patient');
    }

    const data = await response.json();
    return data.patient || null;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error; // Re-throw to allow calling code to handle
  }
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
  try {
    const response = await fetch(`/api/admin/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update patient');
    }

    const data = await response.json();
    return data.patient || null;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error; // Re-throw to allow calling code to handle
  }
}

export async function createPatientFromApplication(
  applicationId: string,
  patientData: Partial<Patient>
): Promise<Patient | null> {
  try {
    // First, get the application details
    const application = await getApplicationById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    // Create patient data from application
    const newPatientData = {
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      address: application.address,
      serviceId: application.serviceId,
      serviceName: application.serviceName,
      applicationId: applicationId,
      ...patientData, // Override with any specific patient data
    };

    return await createPatient(newPatientData);
  } catch (error) {
    console.error('Error creating patient from application:', error);
    throw error;
  }
}

// Utility functions for backward compatibility
export async function addPatient(data: Omit<Patient, "id" | "createdAt">): Promise<Patient | null> {
  return createPatient(data);
}

export async function deletePatient(id: string): Promise<boolean> {
  try {
    // For now, we'll just mark patients as inactive since there's no delete endpoint
    // In a real app, you might want to implement soft delete
    console.warn('Patient deletion not implemented - patients should be marked inactive instead');
    return false;
  } catch (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
}