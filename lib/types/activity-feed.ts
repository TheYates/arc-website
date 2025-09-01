export type ActivityType = 
  | "care_note_created"
  | "medical_review_created"
  | "medication_prescribed"
  | "medication_administered"
  | "vital_signs_recorded"
  | "patient_assigned"
  | "service_request_created"
  | "urgent_alert"
  | "care_plan_updated";

export type ActivityPriority = "low" | "medium" | "high" | "urgent";

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  priority: ActivityPriority;
  title: string;
  description: string;
  patientId: string;
  patientName: string;
  createdById: string;
  createdByName: string;
  createdByRole: "caregiver" | "reviewer" | "admin" | "super_admin";
  createdAt: string;
  metadata?: {
    medicationName?: string;
    vitalType?: string;
    reviewType?: string;
    noteType?: string;
    [key: string]: any;
  };
}

export interface ActivityFeedResponse {
  activities: ActivityFeedItem[];
  hasMore: boolean;
  nextCursor?: string;
}

// Activity configuration for different types
export const ACTIVITY_CONFIG: Record<ActivityType, {
  icon: string;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
  iconColorClass: string;
}> = {
  care_note_created: {
    icon: "FileText",
    colorClass: "text-blue-900 dark:text-blue-100",
    bgColorClass: "bg-blue-50 dark:bg-blue-900/20",
    borderColorClass: "border-blue-200 dark:border-blue-700",
    iconColorClass: "text-blue-600 dark:text-blue-400"
  },
  medical_review_created: {
    icon: "Stethoscope",
    colorClass: "text-purple-900 dark:text-purple-100",
    bgColorClass: "bg-purple-50 dark:bg-purple-900/20",
    borderColorClass: "border-purple-200 dark:border-purple-700",
    iconColorClass: "text-purple-600 dark:text-purple-400"
  },
  medication_prescribed: {
    icon: "Pill",
    colorClass: "text-green-900 dark:text-green-100",
    bgColorClass: "bg-green-50 dark:bg-green-900/20",
    borderColorClass: "border-green-200 dark:border-green-700",
    iconColorClass: "text-green-600 dark:text-green-400"
  },
  medication_administered: {
    icon: "CheckCircle",
    colorClass: "text-teal-900 dark:text-teal-100",
    bgColorClass: "bg-teal-50 dark:bg-teal-900/20",
    borderColorClass: "border-teal-200 dark:border-teal-700",
    iconColorClass: "text-teal-600 dark:text-teal-400"
  },
  vital_signs_recorded: {
    icon: "Activity",
    colorClass: "text-red-900 dark:text-red-100",
    bgColorClass: "bg-red-50 dark:bg-red-900/20",
    borderColorClass: "border-red-200 dark:border-red-700",
    iconColorClass: "text-red-600 dark:text-red-400"
  },
  patient_assigned: {
    icon: "UserPlus",
    colorClass: "text-indigo-900 dark:text-indigo-100",
    bgColorClass: "bg-indigo-50 dark:bg-indigo-900/20",
    borderColorClass: "border-indigo-200 dark:border-indigo-700",
    iconColorClass: "text-indigo-600 dark:text-indigo-400"
  },
  service_request_created: {
    icon: "Bell",
    colorClass: "text-yellow-900 dark:text-yellow-100",
    bgColorClass: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColorClass: "border-yellow-200 dark:border-yellow-700",
    iconColorClass: "text-yellow-600 dark:text-yellow-400"
  },
  urgent_alert: {
    icon: "AlertTriangle",
    colorClass: "text-orange-900 dark:text-orange-100",
    bgColorClass: "bg-orange-50 dark:bg-orange-900/20",
    borderColorClass: "border-orange-200 dark:border-orange-700",
    iconColorClass: "text-orange-600 dark:text-orange-400"
  },
  care_plan_updated: {
    icon: "Edit",
    colorClass: "text-slate-900 dark:text-slate-100",
    bgColorClass: "bg-slate-50 dark:bg-slate-900/20",
    borderColorClass: "border-slate-200 dark:border-slate-700",
    iconColorClass: "text-slate-600 dark:text-slate-400"
  }
};
