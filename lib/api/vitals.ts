import { v4 as uuidv4 } from "uuid";
import {
  VitalSigns,
  VitalRanges,
  VitalAlert,
  VitalSchedule,
  VitalsTrend,
  VitalType,
  AlertSeverity,
  VitalFrequency,
  TimeRange,
} from "@/lib/types/vitals";

// Storage keys
const VITALS_STORAGE_KEY = "vitals_signs";
const VITAL_RANGES_STORAGE_KEY = "vital_ranges";
const VITAL_ALERTS_STORAGE_KEY = "vital_alerts";
const VITAL_SCHEDULES_STORAGE_KEY = "vital_schedules";

// Default vital ranges for adults
const defaultVitalRanges: VitalRanges[] = [
  {
    id: uuidv4(),
    name: "Adult Default",
    ageMin: 18,
    ageMax: 65,
    gender: "all",
    bloodPressureSystolicMin: 90,
    bloodPressureSystolicMax: 140,
    bloodPressureDiastolicMin: 60,
    bloodPressureDiastolicMax: 90,
    heartRateMin: 60,
    heartRateMax: 100,
    temperatureMin: 36.1,
    temperatureMax: 37.2,
    oxygenSaturationMin: 95,
    oxygenSaturationMax: 100,
    bloodSugarMin: 70,
    bloodSugarMax: 140,
    isDefault: true,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Senior Default",
    ageMin: 65,
    gender: "all",
    bloodPressureSystolicMin: 90,
    bloodPressureSystolicMax: 150,
    bloodPressureDiastolicMin: 60,
    bloodPressureDiastolicMax: 90,
    heartRateMin: 50,
    heartRateMax: 100,
    temperatureMin: 36.1,
    temperatureMax: 37.2,
    oxygenSaturationMin: 95,
    oxygenSaturationMax: 100,
    bloodSugarMin: 70,
    bloodSugarMax: 180,
    isDefault: true,
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
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

// Initialize default data
const initializeVitalRanges = (): VitalRanges[] => {
  const existing = getFromStorage<VitalRanges>(VITAL_RANGES_STORAGE_KEY);
  if (existing.length === 0) {
    saveToStorage(VITAL_RANGES_STORAGE_KEY, defaultVitalRanges);
    return defaultVitalRanges;
  }
  return existing;
};

// Vital Signs CRUD
export const getVitalSigns = (patientId?: string): VitalSigns[] => {
  const vitals = getFromStorage<VitalSigns>(VITALS_STORAGE_KEY);
  return patientId ? vitals.filter((v) => v.patientId === patientId) : vitals;
};

export const getVitalSignById = (id: string): VitalSigns | null => {
  const vitals = getFromStorage<VitalSigns>(VITALS_STORAGE_KEY);
  return vitals.find((v) => v.id === id) || null;
};

export const createVitalSigns = (
  vitalData: Omit<
    VitalSigns,
    "id" | "createdAt" | "updatedAt" | "isAlerted" | "alertedValues"
  >
): VitalSigns => {
  const vitals = getFromStorage<VitalSigns>(VITALS_STORAGE_KEY);
  const ranges = getVitalRanges();

  const newVital: VitalSigns = {
    ...vitalData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAlerted: false,
    alertedValues: [],
  };

  // Check for alerts
  const alertCheck = checkVitalAlerts(newVital, ranges);
  newVital.isAlerted = alertCheck.hasAlerts;
  newVital.alertedValues = alertCheck.alertedValues;

  vitals.push(newVital);
  saveToStorage(VITALS_STORAGE_KEY, vitals);

  // Create alerts if needed
  if (alertCheck.hasAlerts) {
    alertCheck.alerts.forEach((alert) => createVitalAlert(alert));
  }

  return newVital;
};

export const updateVitalSigns = (
  id: string,
  updates: Partial<VitalSigns>
): VitalSigns | null => {
  const vitals = getFromStorage<VitalSigns>(VITALS_STORAGE_KEY);
  const index = vitals.findIndex((v) => v.id === id);

  if (index === -1) return null;

  vitals[index] = {
    ...vitals[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveToStorage(VITALS_STORAGE_KEY, vitals);
  return vitals[index];
};

export const deleteVitalSigns = (id: string): boolean => {
  const vitals = getFromStorage<VitalSigns>(VITALS_STORAGE_KEY);
  const filteredVitals = vitals.filter((v) => v.id !== id);

  if (filteredVitals.length === vitals.length) return false;

  saveToStorage(VITALS_STORAGE_KEY, filteredVitals);
  return true;
};

// Vital Ranges CRUD
export const getVitalRanges = (): VitalRanges[] => {
  return initializeVitalRanges();
};

export const createVitalRange = (
  rangeData: Omit<VitalRanges, "id" | "createdAt" | "updatedAt">
): VitalRanges => {
  const ranges = getFromStorage<VitalRanges>(VITAL_RANGES_STORAGE_KEY);

  const newRange: VitalRanges = {
    ...rangeData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ranges.push(newRange);
  saveToStorage(VITAL_RANGES_STORAGE_KEY, ranges);
  return newRange;
};

// Alert checking logic
const checkVitalAlerts = (
  vital: VitalSigns,
  ranges: VitalRanges[]
): {
  hasAlerts: boolean;
  alertedValues: string[];
  alerts: Omit<VitalAlert, "id" | "createdAt">[];
} => {
  const applicableRange = ranges.find((r) => r.isDefault) || ranges[0];
  if (!applicableRange)
    return { hasAlerts: false, alertedValues: [], alerts: [] };

  const alerts: Omit<VitalAlert, "id" | "createdAt">[] = [];
  const alertedValues: string[] = [];

  // Check blood pressure
  if (vital.bloodPressure) {
    const { systolic, diastolic } = vital.bloodPressure;
    let severity: AlertSeverity = "low";

    if (
      systolic < applicableRange.bloodPressureSystolicMin ||
      systolic > applicableRange.bloodPressureSystolicMax ||
      diastolic < applicableRange.bloodPressureDiastolicMin ||
      diastolic > applicableRange.bloodPressureDiastolicMax
    ) {
      if (systolic > 180 || diastolic > 120) severity = "critical";
      else if (systolic > 160 || diastolic > 100) severity = "high";
      else if (systolic < 90 || diastolic < 60) severity = "medium";

      alertedValues.push("bloodPressure");
      alerts.push({
        patientId: vital.patientId,
        vitalSignsId: vital.id,
        caregiverId: vital.caregiverId,
        vitalType: "bloodPressure",
        actualValue: JSON.stringify(vital.bloodPressure),
        expectedRange: JSON.stringify({
          systolicMin: applicableRange.bloodPressureSystolicMin,
          systolicMax: applicableRange.bloodPressureSystolicMax,
          diastolicMin: applicableRange.bloodPressureDiastolicMin,
          diastolicMax: applicableRange.bloodPressureDiastolicMax,
        }),
        severity,
        isAcknowledged: false,
        notificationsSent: [],
      });
    }
  }

  // Check heart rate
  if (vital.heartRate !== undefined) {
    let severity: AlertSeverity = "low";

    if (
      vital.heartRate < applicableRange.heartRateMin ||
      vital.heartRate > applicableRange.heartRateMax
    ) {
      if (vital.heartRate < 40 || vital.heartRate > 150) severity = "critical";
      else if (vital.heartRate < 50 || vital.heartRate > 120) severity = "high";
      else severity = "medium";

      alertedValues.push("heartRate");
      alerts.push({
        patientId: vital.patientId,
        vitalSignsId: vital.id,
        caregiverId: vital.caregiverId,
        vitalType: "heartRate",
        actualValue: vital.heartRate.toString(),
        expectedRange: JSON.stringify({
          min: applicableRange.heartRateMin,
          max: applicableRange.heartRateMax,
        }),
        severity,
        isAcknowledged: false,
        notificationsSent: [],
      });
    }
  }

  // Check temperature
  if (vital.temperature !== undefined) {
    let severity: AlertSeverity = "low";

    if (
      vital.temperature < applicableRange.temperatureMin ||
      vital.temperature > applicableRange.temperatureMax
    ) {
      if (vital.temperature > 39.0 || vital.temperature < 35.0)
        severity = "critical";
      else if (vital.temperature > 38.5 || vital.temperature < 35.5)
        severity = "high";
      else severity = "medium";

      alertedValues.push("temperature");
      alerts.push({
        patientId: vital.patientId,
        vitalSignsId: vital.id,
        caregiverId: vital.caregiverId,
        vitalType: "temperature",
        actualValue: vital.temperature.toString(),
        expectedRange: JSON.stringify({
          min: applicableRange.temperatureMin,
          max: applicableRange.temperatureMax,
        }),
        severity,
        isAcknowledged: false,
        notificationsSent: [],
      });
    }
  }

  // Check oxygen saturation
  if (vital.oxygenSaturation !== undefined) {
    let severity: AlertSeverity = "low";

    if (vital.oxygenSaturation < applicableRange.oxygenSaturationMin) {
      if (vital.oxygenSaturation < 88) severity = "critical";
      else if (vital.oxygenSaturation < 92) severity = "high";
      else severity = "medium";

      alertedValues.push("oxygenSaturation");
      alerts.push({
        patientId: vital.patientId,
        vitalSignsId: vital.id,
        caregiverId: vital.caregiverId,
        vitalType: "oxygenSaturation",
        actualValue: vital.oxygenSaturation.toString(),
        expectedRange: JSON.stringify({
          min: applicableRange.oxygenSaturationMin,
          max: applicableRange.oxygenSaturationMax,
        }),
        severity,
        isAcknowledged: false,
        notificationsSent: [],
      });
    }
  }

  // Check blood sugar
  if (vital.bloodSugar !== undefined) {
    let severity: AlertSeverity = "low";

    if (
      vital.bloodSugar < applicableRange.bloodSugarMin ||
      vital.bloodSugar > applicableRange.bloodSugarMax
    ) {
      if (vital.bloodSugar > 300 || vital.bloodSugar < 50)
        severity = "critical";
      else if (vital.bloodSugar > 250 || vital.bloodSugar < 60)
        severity = "high";
      else severity = "medium";

      alertedValues.push("bloodSugar");
      alerts.push({
        patientId: vital.patientId,
        vitalSignsId: vital.id,
        caregiverId: vital.caregiverId,
        vitalType: "bloodSugar",
        actualValue: vital.bloodSugar.toString(),
        expectedRange: JSON.stringify({
          min: applicableRange.bloodSugarMin,
          max: applicableRange.bloodSugarMax,
        }),
        severity,
        isAcknowledged: false,
        notificationsSent: [],
      });
    }
  }

  return {
    hasAlerts: alerts.length > 0,
    alertedValues,
    alerts,
  };
};

// Vital Alerts CRUD
export const getVitalAlerts = (patientId?: string): VitalAlert[] => {
  const alerts = getFromStorage<VitalAlert>(VITAL_ALERTS_STORAGE_KEY);
  return patientId ? alerts.filter((a) => a.patientId === patientId) : alerts;
};

export const createVitalAlert = (
  alertData: Omit<VitalAlert, "id" | "createdAt">
): VitalAlert => {
  const alerts = getFromStorage<VitalAlert>(VITAL_ALERTS_STORAGE_KEY);

  const newAlert: VitalAlert = {
    ...alertData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  alerts.push(newAlert);
  saveToStorage(VITAL_ALERTS_STORAGE_KEY, alerts);
  return newAlert;
};

export const acknowledgeVitalAlert = (
  id: string,
  acknowledgedBy: string
): VitalAlert | null => {
  const alerts = getFromStorage<VitalAlert>(VITAL_ALERTS_STORAGE_KEY);
  const index = alerts.findIndex((a) => a.id === id);

  if (index === -1) return null;

  alerts[index] = {
    ...alerts[index],
    isAcknowledged: true,
    acknowledgedBy,
    acknowledgedAt: new Date().toISOString(),
  };

  saveToStorage(VITAL_ALERTS_STORAGE_KEY, alerts);
  return alerts[index];
};

// Trends and Analytics
export const getVitalsTrends = (
  patientId: string,
  vitalType: VitalType,
  timeRange: TimeRange
): VitalsTrend => {
  const vitals = getVitalSigns(patientId);
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
    case "1y":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const filteredVitals = vitals
    .filter((v) => new Date(v.recordedAt) >= startDate)
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

  const dataPoints = filteredVitals
    .map((vital) => {
      let value: number | { systolic: number; diastolic: number };

      switch (vitalType) {
        case "bloodPressure":
          if (!vital.bloodPressure) return null;
          value = vital.bloodPressure;
          break;
        case "heartRate":
          if (vital.heartRate === undefined) return null;
          value = vital.heartRate;
          break;
        case "temperature":
          if (vital.temperature === undefined) return null;
          value = vital.temperature;
          break;
        case "oxygenSaturation":
          if (vital.oxygenSaturation === undefined) return null;
          value = vital.oxygenSaturation;
          break;
        case "weight":
          if (vital.weight === undefined) return null;
          value = vital.weight;
          break;
        case "bloodSugar":
          if (vital.bloodSugar === undefined) return null;
          value = vital.bloodSugar;
          break;
        default:
          return null;
      }

      return {
        date: vital.recordedAt,
        value,
        isAlert: vital.alertedValues?.includes(vitalType) || false,
      };
    })
    .filter((point): point is NonNullable<typeof point> => point !== null);

  // Calculate average and trend
  let averageValue:
    | number
    | { systolic: number; diastolic: number }
    | undefined;
  let trend: "improving" | "stable" | "declining" | "concerning" = "stable";

  if (dataPoints.length > 0) {
    if (vitalType === "bloodPressure") {
      const bpValues = dataPoints.map(
        (p) => p.value as { systolic: number; diastolic: number }
      );
      averageValue = {
        systolic:
          bpValues.reduce((sum, bp) => sum + bp.systolic, 0) / bpValues.length,
        diastolic:
          bpValues.reduce((sum, bp) => sum + bp.diastolic, 0) / bpValues.length,
      };
    } else {
      const numericValues = dataPoints.map((p) => p.value as number);
      averageValue =
        numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    }

    // Simple trend calculation based on first half vs second half
    if (dataPoints.length >= 4) {
      const midPoint = Math.floor(dataPoints.length / 2);
      const firstHalf = dataPoints.slice(0, midPoint);
      const secondHalf = dataPoints.slice(midPoint);

      let firstAvg: number, secondAvg: number;

      if (vitalType === "bloodPressure") {
        const firstBP = firstHalf.map(
          (p) => p.value as { systolic: number; diastolic: number }
        );
        const secondBP = secondHalf.map(
          (p) => p.value as { systolic: number; diastolic: number }
        );

        firstAvg =
          firstBP.reduce((sum, bp) => sum + bp.systolic + bp.diastolic, 0) /
          (firstBP.length * 2);
        secondAvg =
          secondBP.reduce((sum, bp) => sum + bp.systolic + bp.diastolic, 0) /
          (secondBP.length * 2);
      } else {
        firstAvg =
          firstHalf.reduce((sum, p) => sum + (p.value as number), 0) /
          firstHalf.length;
        secondAvg =
          secondHalf.reduce((sum, p) => sum + (p.value as number), 0) /
          secondHalf.length;
      }

      const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
      const hasAlerts = dataPoints.some((p) => p.isAlert);

      if (hasAlerts) {
        trend = "concerning";
      } else if (Math.abs(changePercent) < 5) {
        trend = "stable";
      } else if (
        (vitalType === "bloodPressure" && changePercent < 0) ||
        (vitalType === "heartRate" && Math.abs(changePercent) < 10) ||
        (vitalType === "temperature" && Math.abs(changePercent) < 2) ||
        (vitalType === "oxygenSaturation" && changePercent > 0) ||
        (vitalType === "bloodSugar" && Math.abs(changePercent) < 15)
      ) {
        trend = "improving";
      } else {
        trend = "declining";
      }
    }
  }

  return {
    patientId,
    vitalType,
    timeRange,
    dataPoints,
    averageValue,
    trend,
    generatedAt: new Date().toISOString(),
  };
};
