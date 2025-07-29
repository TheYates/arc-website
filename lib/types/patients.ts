export type Gender = "male" | "female" | "other";
export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type CareLevel = "low" | "medium" | "high" | "critical";
export type PatientStatus = "stable" | "improving" | "declining" | "critical";

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
