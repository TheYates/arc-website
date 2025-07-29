import { v4 as uuidv4 } from "uuid";
import {
  Medication,
  MedicationSchedule,
  MedicationAdministration,
  MedicationInteraction,
  MedicationCompliance,
  MedicationReminder,
  MedicationAlert,
  PatientSymptomReport,
  MedicationFrequency,
  AdministrationStatus,
  MedicationAlertType,
} from "@/lib/types/medications";

// Storage keys
const MEDICATIONS_STORAGE_KEY = "medications";
const MEDICATION_SCHEDULES_STORAGE_KEY = "medication_schedules";
const MEDICATION_ADMINISTRATIONS_STORAGE_KEY = "medication_administrations";
const MEDICATION_INTERACTIONS_STORAGE_KEY = "medication_interactions";
const MEDICATION_REMINDERS_STORAGE_KEY = "medication_reminders";
const MEDICATION_ALERTS_STORAGE_KEY = "medication_alerts";
const SYMPTOM_REPORTS_STORAGE_KEY = "symptom_reports";

// Common medication interactions database
const defaultInteractions: Omit<
  MedicationInteraction,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    medication1: "warfarin",
    medication2: "aspirin",
    interactionType: "major",
    description:
      "Increased risk of bleeding when warfarin is combined with aspirin",
    recommendation:
      "Monitor closely for signs of bleeding. Consider alternative pain relief.",
    isActive: true,
  },
  {
    medication1: "metformin",
    medication2: "insulin",
    interactionType: "moderate",
    description: "Combined use may increase risk of hypoglycemia",
    recommendation:
      "Monitor blood glucose levels closely and adjust dosages as needed.",
    isActive: true,
  },
  {
    medication1: "lisinopril",
    medication2: "spironolactone",
    interactionType: "moderate",
    description: "Increased risk of hyperkalemia (high potassium)",
    recommendation: "Monitor potassium levels regularly.",
    isActive: true,
  },
  // Add more common interactions as needed
];

// Utility functions
const getFromStorage = <T>(key: string, defaultValue: T[] = []): T[] => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Initialize interactions database
const initializeInteractions = (): void => {
  const existing = getFromStorage<MedicationInteraction>(
    MEDICATION_INTERACTIONS_STORAGE_KEY
  );
  if (existing.length === 0) {
    const interactions = defaultInteractions.map((interaction) => ({
      ...interaction,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    saveToStorage(MEDICATION_INTERACTIONS_STORAGE_KEY, interactions);
  }
};

// Medication CRUD
export const getMedications = (patientId?: string): Medication[] => {
  const medications = getFromStorage<Medication>(MEDICATIONS_STORAGE_KEY);
  return patientId
    ? medications.filter((m) => m.patientId === patientId)
    : medications;
};

export const getMedicationById = (id: string): Medication | null => {
  const medications = getFromStorage<Medication>(MEDICATIONS_STORAGE_KEY);
  return medications.find((m) => m.id === id) || null;
};

export const createMedication = (
  medicationData: Omit<Medication, "id" | "createdAt" | "updatedAt">
): {
  medication: Medication;
  interactions: MedicationInteraction[];
  alerts: MedicationAlert[];
} => {
  const medications = getFromStorage<Medication>(MEDICATIONS_STORAGE_KEY);

  const newMedication: Medication = {
    ...medicationData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  medications.push(newMedication);
  saveToStorage(MEDICATIONS_STORAGE_KEY, medications);

  // Check for interactions with existing medications
  const patientMedications = medications.filter(
    (m) =>
      m.patientId === newMedication.patientId &&
      m.isActive &&
      m.id !== newMedication.id
  );

  const interactions = checkMedicationInteractions(
    newMedication,
    patientMedications
  );

  // Create alerts for interactions
  const alerts: MedicationAlert[] = [];
  interactions.forEach((interaction) => {
    const alert = createMedicationAlert({
      patientId: newMedication.patientId,
      medicationId: newMedication.id,
      alertType: "interaction",
      severity:
        interaction.interactionType === "contraindicated"
          ? "critical"
          : interaction.interactionType === "major"
          ? "high"
          : interaction.interactionType === "moderate"
          ? "medium"
          : "low",
      message: `Drug interaction detected: ${interaction.description}`,
      isAcknowledged: false,
      actionRequired: interaction.recommendation,
    });
    alerts.push(alert);
  });

  // Create schedule if specified
  if (!newMedication.isPRN) {
    createMedicationSchedule({
      medicationId: newMedication.id,
      patientId: newMedication.patientId,
      scheduledTimes: generateScheduledTimes(newMedication.frequency),
      isActive: true,
    });
  }

  return { medication: newMedication, interactions, alerts };
};

export const updateMedication = (
  id: string,
  updates: Partial<Medication>,
  updatedBy: string
): Medication | null => {
  const medications = getFromStorage<Medication>(MEDICATIONS_STORAGE_KEY);
  const index = medications.findIndex((m) => m.id === id);

  if (index === -1) return null;

  medications[index] = {
    ...medications[index],
    ...updates,
    lastModifiedBy: updatedBy,
    updatedAt: new Date().toISOString(),
  };

  saveToStorage(MEDICATIONS_STORAGE_KEY, medications);

  // Update schedule if frequency changed
  if (updates.frequency) {
    const schedules = getFromStorage<MedicationSchedule>(
      MEDICATION_SCHEDULES_STORAGE_KEY
    );
    const scheduleIndex = schedules.findIndex((s) => s.medicationId === id);
    if (scheduleIndex !== -1) {
      schedules[scheduleIndex].scheduledTimes = generateScheduledTimes(
        updates.frequency
      );
      schedules[scheduleIndex].updatedAt = new Date().toISOString();
      saveToStorage(MEDICATION_SCHEDULES_STORAGE_KEY, schedules);
    }
  }

  return medications[index];
};

export const discontinueMedication = (
  id: string,
  discontinuedBy: string,
  reason?: string
): Medication | null => {
  const medications = getFromStorage<Medication>(MEDICATIONS_STORAGE_KEY);
  const index = medications.findIndex((m) => m.id === id);

  if (index === -1) return null;

  medications[index] = {
    ...medications[index],
    isActive: false,
    endDate: new Date().toISOString(),
    lastModifiedBy: discontinuedBy,
    updatedAt: new Date().toISOString(),
    notes: medications[index].notes
      ? `${medications[index].notes}\n\nDiscontinued: ${
          reason || "No reason specified"
        }`
      : `Discontinued: ${reason || "No reason specified"}`,
  };

  saveToStorage(MEDICATIONS_STORAGE_KEY, medications);

  // Deactivate schedule
  const schedules = getFromStorage<MedicationSchedule>(
    MEDICATION_SCHEDULES_STORAGE_KEY
  );
  const scheduleIndex = schedules.findIndex((s) => s.medicationId === id);
  if (scheduleIndex !== -1) {
    schedules[scheduleIndex].isActive = false;
    schedules[scheduleIndex].updatedAt = new Date().toISOString();
    saveToStorage(MEDICATION_SCHEDULES_STORAGE_KEY, schedules);
  }

  // Create discontinuation alert
  createMedicationAlert({
    patientId: medications[index].patientId,
    medicationId: id,
    alertType: "discontinuation",
    severity: "medium",
    message: `Medication ${medications[index].medicationName} has been discontinued`,
    isAcknowledged: false,
    actionRequired: "Inform patient and update care plan",
  });

  return medications[index];
};

// Medication Schedule Management
export const getMedicationSchedules = (
  patientId?: string
): MedicationSchedule[] => {
  const schedules = getFromStorage<MedicationSchedule>(
    MEDICATION_SCHEDULES_STORAGE_KEY
  );
  return patientId
    ? schedules.filter((s) => s.patientId === patientId)
    : schedules;
};

export const createMedicationSchedule = (
  scheduleData: Omit<MedicationSchedule, "id" | "createdAt" | "updatedAt">
): MedicationSchedule => {
  const schedules = getFromStorage<MedicationSchedule>(
    MEDICATION_SCHEDULES_STORAGE_KEY
  );

  const newSchedule: MedicationSchedule = {
    ...scheduleData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  schedules.push(newSchedule);
  saveToStorage(MEDICATION_SCHEDULES_STORAGE_KEY, schedules);
  return newSchedule;
};

// Generate scheduled times based on frequency
const generateScheduledTimes = (frequency: MedicationFrequency): string[] => {
  switch (frequency) {
    case "once_daily":
      return ["08:00"];
    case "twice_daily":
      return ["08:00", "20:00"];
    case "three_times_daily":
      return ["08:00", "14:00", "20:00"];
    case "four_times_daily":
      return ["06:00", "12:00", "18:00", "22:00"];
    case "every_6_hours":
      return ["06:00", "12:00", "18:00", "00:00"];
    case "every_8_hours":
      return ["08:00", "16:00", "00:00"];
    case "every_12_hours":
      return ["08:00", "20:00"];
    default:
      return ["08:00"];
  }
};

// Medication Administration
export const getMedicationAdministrations = (
  patientId?: string,
  medicationId?: string
): MedicationAdministration[] => {
  const administrations = getFromStorage<MedicationAdministration>(
    MEDICATION_ADMINISTRATIONS_STORAGE_KEY
  );
  let filtered = administrations;

  if (patientId) {
    filtered = filtered.filter((a) => a.patientId === patientId);
  }

  if (medicationId) {
    filtered = filtered.filter((a) => a.medicationId === medicationId);
  }

  return filtered;
};

export const recordMedicationAdministration = (
  administrationData: Omit<
    MedicationAdministration,
    "id" | "createdAt" | "updatedAt"
  >
): MedicationAdministration => {
  const administrations = getFromStorage<MedicationAdministration>(
    MEDICATION_ADMINISTRATIONS_STORAGE_KEY
  );

  const newAdministration: MedicationAdministration = {
    ...administrationData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  administrations.push(newAdministration);
  saveToStorage(MEDICATION_ADMINISTRATIONS_STORAGE_KEY, administrations);

  // Create alerts for missed or refused doses
  if (
    administrationData.status === "missed" ||
    administrationData.status === "refused"
  ) {
    createMedicationAlert({
      patientId: administrationData.patientId,
      medicationId: administrationData.medicationId,
      alertType: "missed_dose",
      severity: "medium",
      message: `Medication dose ${administrationData.status}: ${
        administrationData.notes || "No reason provided"
      }`,
      isAcknowledged: false,
    });
  }

  return newAdministration;
};

// Medication Interactions
export const checkMedicationInteractions = (
  newMedication: Medication,
  existingMedications: Medication[]
): MedicationInteraction[] => {
  initializeInteractions();
  const interactions = getFromStorage<MedicationInteraction>(
    MEDICATION_INTERACTIONS_STORAGE_KEY
  );
  const detectedInteractions: MedicationInteraction[] = [];

  existingMedications.forEach((existingMed) => {
    const interaction = interactions.find(
      (int) =>
        int.isActive &&
        ((int.medication1.toLowerCase() ===
          newMedication.medicationName.toLowerCase() &&
          int.medication2.toLowerCase() ===
            existingMed.medicationName.toLowerCase()) ||
          (int.medication2.toLowerCase() ===
            newMedication.medicationName.toLowerCase() &&
            int.medication1.toLowerCase() ===
              existingMed.medicationName.toLowerCase()))
    );

    if (interaction) {
      detectedInteractions.push(interaction);
    }
  });

  return detectedInteractions;
};

// Medication Alerts
export const getMedicationAlerts = (patientId?: string): MedicationAlert[] => {
  const alerts = getFromStorage<MedicationAlert>(MEDICATION_ALERTS_STORAGE_KEY);
  return patientId ? alerts.filter((a) => a.patientId === patientId) : alerts;
};

export const createMedicationAlert = (
  alertData: Omit<MedicationAlert, "id" | "createdAt">
): MedicationAlert => {
  const alerts = getFromStorage<MedicationAlert>(MEDICATION_ALERTS_STORAGE_KEY);

  const newAlert: MedicationAlert = {
    ...alertData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  alerts.push(newAlert);
  saveToStorage(MEDICATION_ALERTS_STORAGE_KEY, alerts);
  return newAlert;
};

export const acknowledgeMedicationAlert = (
  id: string,
  acknowledgedBy: string
): MedicationAlert | null => {
  const alerts = getFromStorage<MedicationAlert>(MEDICATION_ALERTS_STORAGE_KEY);
  const index = alerts.findIndex((a) => a.id === id);

  if (index === -1) return null;

  alerts[index] = {
    ...alerts[index],
    isAcknowledged: true,
    acknowledgedBy,
    acknowledgedAt: new Date().toISOString(),
  };

  saveToStorage(MEDICATION_ALERTS_STORAGE_KEY, alerts);
  return alerts[index];
};

// Medication Compliance
export const calculateMedicationCompliance = (
  patientId: string,
  medicationId: string,
  timeRange: "24h" | "7d" | "30d" | "90d"
): MedicationCompliance => {
  const administrations = getMedicationAdministrations(patientId, medicationId);
  const schedules = getMedicationSchedules(patientId);
  const medication = getMedicationById(medicationId);

  if (!medication) {
    throw new Error("Medication not found");
  }

  const schedule = schedules.find((s) => s.medicationId === medicationId);
  if (!schedule) {
    throw new Error("Schedule not found");
  }

  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "24h":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
  }

  const filteredAdministrations = administrations.filter(
    (a) => new Date(a.scheduledTime) >= startDate
  );

  // Calculate total scheduled doses
  const daysDiff = Math.ceil(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalScheduled = daysDiff * schedule.scheduledTimes.length;

  const totalAdministered = filteredAdministrations.filter(
    (a) => a.status === "administered" || a.status === "partial"
  ).length;

  const totalMissed = filteredAdministrations.filter(
    (a) => a.status === "missed"
  ).length;

  const totalRefused = filteredAdministrations.filter(
    (a) => a.status === "refused"
  ).length;

  const complianceRate =
    totalScheduled > 0 ? (totalAdministered / totalScheduled) * 100 : 0;

  const missedDoses = filteredAdministrations
    .filter((a) => a.status === "missed")
    .map((a) => ({
      date: new Date(a.scheduledTime).toISOString().split("T")[0],
      time: new Date(a.scheduledTime).toLocaleTimeString(),
      reason: a.notes || "No reason provided",
    }));

  return {
    id: uuidv4(),
    patientId,
    medicationId,
    timeRange,
    totalScheduled,
    totalAdministered,
    totalMissed,
    totalRefused,
    complianceRate,
    missedDoses,
    generatedAt: new Date().toISOString(),
  };
};

// Patient Symptom Reports
export const getSymptomReports = (
  patientId?: string
): PatientSymptomReport[] => {
  const reports = getFromStorage<PatientSymptomReport>(
    SYMPTOM_REPORTS_STORAGE_KEY
  );
  return patientId ? reports.filter((r) => r.patientId === patientId) : reports;
};

export const createSymptomReport = (
  reportData: Omit<
    PatientSymptomReport,
    "id" | "reportedAt" | "isResolved" | "followUpRequired"
  >
): PatientSymptomReport => {
  const reports = getFromStorage<PatientSymptomReport>(
    SYMPTOM_REPORTS_STORAGE_KEY
  );

  const newReport: PatientSymptomReport = {
    ...reportData,
    id: uuidv4(),
    reportedAt: new Date().toISOString(),
    isResolved: false,
    followUpRequired: reportData.severity >= 3, // Require follow-up for moderate to severe symptoms
  };

  reports.push(newReport);
  saveToStorage(SYMPTOM_REPORTS_STORAGE_KEY, reports);

  // Create alert for severe symptoms
  if (reportData.severity >= 4) {
    createMedicationAlert({
      patientId: reportData.patientId,
      medicationId: reportData.medicationId,
      alertType: "side_effect",
      severity: reportData.severity === 5 ? "critical" : "high",
      message: `Severe symptoms reported: ${reportData.symptoms.join(", ")}`,
      isAcknowledged: false,
      actionRequired: "Immediate medical review required",
    });
  }

  return newReport;
};

export const reviewSymptomReport = (
  id: string,
  reviewData: {
    reviewedBy: string;
    reviewNotes: string;
    actionTaken?: string;
    isResolved?: boolean;
    followUpDate?: string;
  }
): PatientSymptomReport | null => {
  const reports = getFromStorage<PatientSymptomReport>(
    SYMPTOM_REPORTS_STORAGE_KEY
  );
  const index = reports.findIndex((r) => r.id === id);

  if (index === -1) return null;

  reports[index] = {
    ...reports[index],
    ...reviewData,
    reviewedAt: new Date().toISOString(),
    resolvedAt: reviewData.isResolved ? new Date().toISOString() : undefined,
  };

  saveToStorage(SYMPTOM_REPORTS_STORAGE_KEY, reports);
  return reports[index];
};
