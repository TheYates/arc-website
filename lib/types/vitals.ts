export interface VitalSigns {
  id: string;
  patientId: string;
  caregiverId: string;
  recordedAt: string;
  // Vital measurements
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number; // BPM
  temperature?: number; // Celsius
  oxygenSaturation?: number; // Percentage
  weight?: number; // Kilograms
  bloodSugar?: number; // mg/dL
  // Additional data
  notes?: string;
  isAlerted?: boolean; // If any vital is outside normal range
  alertedValues?: string[]; // Which vitals triggered alerts
  createdAt: string;
  updatedAt: string;
}

export interface VitalRanges {
  id: string;
  name: string;
  ageMin?: number;
  ageMax?: number;
  gender?: "male" | "female" | "all";
  // Blood pressure ranges
  bloodPressureSystolicMin: number;
  bloodPressureSystolicMax: number;
  bloodPressureDiastolicMin: number;
  bloodPressureDiastolicMax: number;
  // Heart rate ranges
  heartRateMin: number;
  heartRateMax: number;
  // Temperature ranges (Celsius)
  temperatureMin: number;
  temperatureMax: number;
  // Oxygen saturation ranges
  oxygenSaturationMin: number;
  oxygenSaturationMax: number;
  // Blood sugar ranges (mg/dL)
  bloodSugarMin: number;
  bloodSugarMax: number;
  // Weight ranges (optional, more for tracking trends)
  weightMin?: number;
  weightMax?: number;
  isDefault: boolean;
  createdBy: string; // Admin who created this range
  createdAt: string;
  updatedAt: string;
}

export interface VitalAlert {
  id: string;
  patientId: string;
  vitalSignsId: string;
  caregiverId: string;
  vitalType:
    | "bloodPressure"
    | "heartRate"
    | "temperature"
    | "oxygenSaturation"
    | "weight"
    | "bloodSugar";
  actualValue: string; // JSON stringified value (for BP it's object, for others it's number)
  expectedRange: string; // JSON stringified range
  severity: "low" | "medium" | "high" | "critical";
  isAcknowledged: boolean;
  acknowledgedBy?: string; // Reviewer ID
  acknowledgedAt?: string;
  notificationsSent: string[]; // Array of user IDs who were notified
  createdAt: string;
}

export interface VitalSchedule {
  id: string;
  patientId: string;
  frequency:
    | "daily"
    | "twice_daily"
    | "three_times_daily"
    | "weekly"
    | "custom";
  customFrequency?: string; // For custom schedules like "every 4 hours"
  vitalsToRecord: (
    | "bloodPressure"
    | "heartRate"
    | "temperature"
    | "oxygenSaturation"
    | "weight"
    | "bloodSugar"
  )[];
  scheduledTimes: string[]; // Array of times like ["08:00", "20:00"]
  isActive: boolean;
  createdBy: string; // Admin or Reviewer ID
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface VitalsTrend {
  patientId: string;
  vitalType:
    | "bloodPressure"
    | "heartRate"
    | "temperature"
    | "oxygenSaturation"
    | "weight"
    | "bloodSugar";
  timeRange: "24h" | "7d" | "30d" | "90d" | "1y";
  dataPoints: {
    date: string;
    value: number | { systolic: number; diastolic: number }; // BP is object, others are numbers
    isAlert: boolean;
  }[];
  averageValue?: number | { systolic: number; diastolic: number };
  trend: "improving" | "stable" | "declining" | "concerning";
  generatedAt: string;
}

// Enums for better type safety
export type VitalType =
  | "bloodPressure"
  | "heartRate"
  | "temperature"
  | "oxygenSaturation"
  | "weight"
  | "bloodSugar";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type VitalFrequency =
  | "daily"
  | "twice_daily"
  | "three_times_daily"
  | "weekly"
  | "custom";
export type TrendDirection =
  | "improving"
  | "stable"
  | "declining"
  | "concerning";
export type TimeRange = "24h" | "7d" | "30d" | "90d" | "1y";
