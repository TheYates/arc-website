export interface Medication {
  id: string;
  patientId: string;
  prescribedBy: string; // Reviewer ID
  medicationName: string;
  genericName?: string;
  dosage: string; // e.g., "10mg", "1 tablet"
  frequency: MedicationFrequency;
  route: MedicationRoute; // oral, injection, topical, etc.
  startDate: string;
  endDate?: string;
  instructions: string;
  sideEffects?: string[];
  contraindications?: string[];
  isActive: boolean;
  isPRN: boolean; // Pro re nata (as needed)
  prnCondition?: string; // When to take PRN medication
  maxDailyDoses?: number; // For PRN medications
  priority: "low" | "medium" | "high" | "critical";
  category: MedicationCategory;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  notes?: string;
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  patientId: string;
  scheduledTimes: string[]; // Array of times like ["08:00", "12:00", "20:00"]
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationAdministration {
  id: string;
  prescriptionId: string; // Updated to match database schema
  patientId: string;
  administeredById?: string; // Updated to match database schema (nullable)
  scheduledTime: string;
  administeredTime?: string; // Updated to match database schema
  status: AdministrationStatus;
  dosageGiven?: string; // Actual dosage given (might be partial)
  notes?: string;
  sideEffectsObserved?: string;
  patientResponse?: "good" | "fair" | "poor" | "adverse";
  witnessedBy?: string; // For controlled substances
  createdAt: string;
  updatedAt?: string; // Made optional to match database

  // Legacy fields for backward compatibility
  medicationId?: string; // @deprecated - use prescriptionId
  caregiverId?: string; // @deprecated - use administeredById
  actualTime?: string; // @deprecated - use administeredTime
}

// Extended interface for API responses that include nested data
export interface MedicationAdministrationWithDetails extends MedicationAdministration {
  prescription?: {
    id: string;
    dosage: string;
    frequency: string;
    medication: {
      id: string;
      name: string;
      genericName?: string;
    };
  };
  administeredBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface MedicationInteraction {
  id: string;
  medication1: string; // Medication name
  medication2: string; // Medication name
  interactionType: "minor" | "moderate" | "major" | "contraindicated";
  description: string;
  recommendation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationCompliance {
  id: string;
  patientId: string;
  medicationId: string;
  timeRange: "24h" | "7d" | "30d" | "90d";
  totalScheduled: number;
  totalAdministered: number;
  totalMissed: number;
  totalRefused: number;
  complianceRate: number; // Percentage
  missedDoses: {
    date: string;
    time: string;
    reason: string;
  }[];
  generatedAt: string;
}

export interface MedicationReminder {
  id: string;
  patientId: string;
  medicationId: string;
  reminderTime: string;
  isActive: boolean;
  reminderType: "patient" | "caregiver" | "both";
  notificationMethods: ("email" | "sms" | "push" | "in_app")[];
  advanceNotice: number; // Minutes before scheduled time
  createdAt: string;
  updatedAt: string;
}

export interface MedicationAlert {
  id: string;
  patientId: string;
  medicationId?: string;
  alertType: MedicationAlertType;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  actionRequired?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface PatientSymptomReport {
  id: string;
  patientId: string;
  medicationId?: string; // If related to a specific medication
  symptoms: string[];
  severity: 1 | 2 | 3 | 4 | 5; // 1 = mild, 5 = severe
  description: string;
  startedAt: string;
  reportedAt: string;
  reviewedBy?: string; // Reviewer ID
  reviewedAt?: string;
  reviewNotes?: string;
  actionTaken?: string;
  isResolved: boolean;
  resolvedAt?: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

// Enums for better type safety
export type MedicationFrequency =
  | "once_daily"
  | "twice_daily"
  | "three_times_daily"
  | "four_times_daily"
  | "every_6_hours"
  | "every_8_hours"
  | "every_12_hours"
  | "weekly"
  | "twice_weekly"
  | "monthly"
  | "as_needed"
  | "custom";

export type MedicationRoute =
  | "oral"
  | "sublingual"
  | "injection_im"
  | "injection_iv"
  | "injection_sc"
  | "topical"
  | "inhalation"
  | "rectal"
  | "nasal"
  | "eye_drops"
  | "ear_drops"
  | "patch";

export type MedicationCategory =
  | "pain_relief"
  | "antibiotics"
  | "heart_medication"
  | "blood_pressure"
  | "diabetes"
  | "mental_health"
  | "vitamins"
  | "supplements"
  | "respiratory"
  | "gastrointestinal"
  | "hormonal"
  | "other";

export type AdministrationStatus =
  | "pending"
  | "administered"
  | "partial"
  | "missed"
  | "refused"
  | "delayed"
  | "cancelled";

export type MedicationAlertType =
  | "missed_dose"
  | "overdue"
  | "interaction"
  | "side_effect"
  | "refill_needed"
  | "expiration"
  | "dosage_change"
  | "discontinuation";
