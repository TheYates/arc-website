import { v4 as uuidv4 } from "uuid";
import { Patient } from "../types/patients";
import { getApplicationById } from "./applications";

const PATIENTS_STORAGE_KEY = "patients_data";

// Default patients data
const defaultPatients: Patient[] = [
  {
    id: "101",
    firstName: "Michael",
    lastName: "Smith",
    email: "michael.s@example.com",
    phone: "+233 24 987 6543",
    address: "456 Oak Ave, Kumasi",
    dateOfBirth: "1975-05-12",
    gender: "male",
    bloodType: "O+",
    heightCm: 175,
    weightKg: 82,
    careLevel: "medium",
    status: "improving",
    assignedDate: "2023-09-16",
    emergencyContactName: "Sarah Smith",
    emergencyContactRelationship: "Spouse",
    emergencyContactPhone: "+233 24 987 6544",
    medicalRecordNumber: "ARC-PAT-10001",
    insuranceProvider: "National Health Insurance",
    insurancePolicyNumber: "NHIS-23456789",
    createdAt: "2023-09-16T10:30:00Z",
    applicationId: "2",
    serviceId: "adamfo-pa",
    serviceName: "ADAMFO PA",
  },
  {
    id: "102",
    firstName: "Jessica",
    lastName: "Wilson",
    email: "jessica.w@example.com",
    phone: "+233 54 234 5678",
    address: "567 Maple Dr, Cape Coast",
    dateOfBirth: "1962-03-24",
    gender: "female",
    bloodType: "A+",
    heightCm: 165,
    weightKg: 68,
    careLevel: "high",
    status: "stable",
    assignedDate: "2023-09-14",
    emergencyContactName: "David Wilson",
    emergencyContactRelationship: "Son",
    emergencyContactPhone: "+233 54 234 5679",
    medicalRecordNumber: "ARC-PAT-10002",
    insuranceProvider: "Ghana Health Service",
    insurancePolicyNumber: "GHS-34567890",
    createdAt: "2023-09-14T14:45:00Z",
    applicationId: "5",
    serviceId: "ahenefie",
    serviceName: "AHENEFIE",
  },
];

// Utility functions for localStorage
function getFromStorage(): Patient[] {
  try {
    const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading patients from storage:", error);
  }

  // Initialize with default data if nothing in storage
  saveToStorage(defaultPatients);
  return defaultPatients;
}

function saveToStorage(patients: Patient[]): void {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (error) {
    console.error("Error saving patients to storage:", error);
  }
}

export async function getPatients(): Promise<Patient[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 150));
  return getFromStorage();
}

export async function getPatientById(id: string): Promise<Patient | null> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100));
  const patients = getFromStorage();
  return patients.find((patient) => patient.id === id) || null;
}

export async function getPatientByApplicationId(
  applicationId: string
): Promise<Patient | null> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100));
  const patients = getFromStorage();
  return (
    patients.find((patient) => patient.applicationId === applicationId) || null
  );
}

export async function createPatient(
  data: Omit<Patient, "id" | "createdAt">
): Promise<Patient> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const patients = getFromStorage();
  const newPatient: Patient = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  const updatedPatients = [...patients, newPatient];
  saveToStorage(updatedPatients);
  return newPatient;
}

export async function updatePatient(
  id: string,
  data: Partial<Patient>
): Promise<Patient | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const patients = getFromStorage();
  const index = patients.findIndex((patient) => patient.id === id);
  if (index === -1) return null;

  const updatedPatient = {
    ...patients[index],
    ...data,
  };

  const updatedPatients = [
    ...patients.slice(0, index),
    updatedPatient,
    ...patients.slice(index + 1),
  ];

  saveToStorage(updatedPatients);
  return updatedPatient;
}

export async function createPatientFromApplication(
  applicationId: string,
  additionalData: Partial<Patient> = {}
): Promise<Patient | null> {
  // Get the application data first
  const application = await getApplicationById(applicationId);
  if (!application || application.status !== "approved") return null;

  // Generate a unique medical record number
  const medicalRecordNumber = `ARC-PAT-${Math.floor(
    10000 + Math.random() * 90000
  )}`;

  // Create the new patient
  const newPatient: Patient = {
    id: uuidv4(),
    firstName: application.firstName,
    lastName: application.lastName,
    email: application.email,
    phone: application.phone,
    address: application.address || "",
    createdAt: new Date().toISOString(),
    assignedDate: new Date().toISOString(),
    medicalRecordNumber,
    applicationId: application.id,
    serviceId: application.serviceId,
    serviceName: application.serviceName,
    careLevel: "medium", // Default value
    status: "stable", // Default value
    ...additionalData,
  };

  // Save the patient
  const patients = getFromStorage();
  const updatedPatients = [...patients, newPatient];
  saveToStorage(updatedPatients);

  return newPatient;
}
