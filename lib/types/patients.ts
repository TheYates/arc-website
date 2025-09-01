export type Gender = "male" | "female" | "other";
export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type CareLevel = "low" | "medium" | "high" | "critical";
export type PatientStatus = "stable" | "improving" | "declining" | "critical";

// Utility functions for formatting database values to display values
export function formatGender(gender?: string): string {
  if (!gender) return "Not specified";

  const genderMap: Record<string, string> = {
    "MALE": "Male",
    "male": "Male",
    "FEMALE": "Female",
    "female": "Female",
    "OTHER": "Other",
    "other": "Other"
  };

  return genderMap[gender] || gender;
}

export function formatBloodType(bloodType?: string): string {
  if (!bloodType) return "Not specified";

  const bloodTypeMap: Record<string, string> = {
    "A_POSITIVE": "A+",
    "A_NEGATIVE": "A-",
    "B_POSITIVE": "B+",
    "B_NEGATIVE": "B-",
    "AB_POSITIVE": "AB+",
    "AB_NEGATIVE": "AB-",
    "O_POSITIVE": "O+",
    "O_NEGATIVE": "O-"
  };

  return bloodTypeMap[bloodType] || bloodType;
}

export function formatCareLevel(careLevel?: string): string {
  if (!careLevel) return "Medium";

  const careLevelMap: Record<string, string> = {
    "LOW": "Low",
    "low": "Low",
    "MEDIUM": "Medium",
    "medium": "Medium",
    "HIGH": "High",
    "high": "High",
    "CRITICAL": "Critical",
    "critical": "Critical"
  };

  return careLevelMap[careLevel] || careLevel;
}

export function formatPatientStatus(status?: string): string {
  if (!status) return "Stable";

  const statusMap: Record<string, string> = {
    "STABLE": "Stable",
    "stable": "Stable",
    "IMPROVING": "Improving",
    "improving": "Improving",
    "DECLINING": "Declining",
    "declining": "Declining",
    "CRITICAL": "Critical",
    "critical": "Critical"
  };

  return statusMap[status] || status;
}

export interface AssignedStaff {
  id: string;
  name: string;
  email: string;
  assignedAt: string;
  assignedBy: string; // Admin who made the assignment
}

export interface Patient {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodType?: BloodType;
  heightCm?: number;
  weightKg?: number;
  careLevel?: CareLevel;
  status?: PatientStatus;
  assignedDate?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  medicalRecordNumber?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  createdAt: string;
  applicationId?: string;
  serviceId?: string;
  serviceName?: string;
  // Assignment fields
  assignedCaregiverId?: string;
  assignedReviewerId?: string;
  assignedCaregiver?: AssignedStaff;
  assignedReviewer?: AssignedStaff;
}
