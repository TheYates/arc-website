import { ActivityFeedItem, ActivityFeedResponse, ActivityType, ActivityPriority } from "@/lib/types/activity-feed";
import { User } from "@/lib/auth";
import { createAuthHeaders } from "@/lib/api/auth-headers";

export async function getActivityFeed(
  options: {
    limit?: number;
    cursor?: string;
    priority?: ActivityPriority;
  } = {},
  user: User | null = null
): Promise<ActivityFeedResponse> {
  try {
    const { limit = 10, cursor, priority } = options;
    const params = new URLSearchParams();
    
    params.append("limit", limit.toString());
    if (cursor) params.append("cursor", cursor);
    if (priority) params.append("priority", priority);

    const headers = createAuthHeaders(user);
    const response = await fetch(`/api/activity-feed?${params.toString()}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch activity feed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get activity feed error:", error);
    return {
      activities: [],
      hasMore: false
    };
  }
}

export async function createActivityFeedItem(
  data: {
    type: ActivityType;
    priority?: ActivityPriority;
    title: string;
    description: string;
    patientId: string;
    metadata?: Record<string, any>;
  },
  user: User | null = null
): Promise<ActivityFeedItem | null> {
  try {
    const headers = createAuthHeaders(user);
    const response = await fetch("/api/activity-feed", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create activity: ${response.statusText}`);
    }

    const result = await response.json();
    return result.activity;
  } catch (error) {
    console.error("Create activity error:", error);
    return null;
  }
}

// Helper functions to create specific activity types
export async function createCareNoteActivity(
  patientId: string,
  patientName: string,
  noteType: string,
  user: User | null = null
): Promise<ActivityFeedItem | null> {
  return createActivityFeedItem({
    type: "care_note_created",
    priority: "medium",
    title: "New Care Note Added",
    description: `A new ${noteType.toLowerCase()} care note has been added for ${patientName}`,
    patientId,
    metadata: { noteType }
  }, user);
}

export async function createMedicalReviewActivity(
  patientId: string,
  patientName: string,
  reviewType: string,
  user: User | null = null
): Promise<ActivityFeedItem | null> {
  return createActivityFeedItem({
    type: "medical_review_created",
    priority: "high",
    title: "Medical Review Completed",
    description: `A ${reviewType.toLowerCase()} medical review has been completed for ${patientName}`,
    patientId,
    metadata: { reviewType }
  }, user);
}

export async function createMedicationPrescribedActivity(
  patientId: string,
  patientName: string,
  medicationName: string,
  user: User | null = null
): Promise<ActivityFeedItem | null> {
  return createActivityFeedItem({
    type: "medication_prescribed",
    priority: "high",
    title: "New Medication Prescribed",
    description: `${medicationName} has been prescribed for ${patientName}`,
    patientId,
    metadata: { medicationName }
  }, user);
}

export async function createMedicationAdministeredActivity(
  patientId: string,
  patientName: string,
  medicationName: string,
  dosage: string,
  user: User | null = null
): Promise<ActivityFeedItem | null> {
  return createActivityFeedItem({
    type: "medication_administered",
    priority: "medium",
    title: "Medication Administered",
    description: `${medicationName} (${dosage}) has been administered to ${patientName}`,
    patientId,
    metadata: { medicationName, dosage }
  }, user);
}

export async function createVitalSignsActivity(
  patientId: string,
  patientName: string,
  vitalTypes: string[],
  user: User | null = null
): Promise<ActivityFeedItem | null> {
  const vitalTypesList = vitalTypes.join(", ");
  return createActivityFeedItem({
    type: "vital_signs_recorded",
    priority: "medium",
    title: "Vital Signs Recorded",
    description: `New vital signs recorded for ${patientName}: ${vitalTypesList}`,
    patientId,
    metadata: { vitalTypes }
  }, user);
}

export async function createPatientAssignedActivity(
  patientId: string,
  patientName: string,
  assigneeRole: "caregiver" | "reviewer",
  assigneeName: string,
  user: User | null = null
): Promise<ActivityFeedItem | null> {
  return createActivityFeedItem({
    type: "patient_assigned",
    priority: "high",
    title: "Patient Assignment",
    description: `${patientName} has been assigned to ${assigneeRole} ${assigneeName}`,
    patientId,
    metadata: { assigneeRole, assigneeName }
  }, user);
}

export async function createServiceRequestActivity(
  patientId: string,
  patientName: string,
  serviceType: string,
  priority: ActivityPriority = "medium",
  user: User | null = null
): Promise<ActivityFeedItem | null> {
  return createActivityFeedItem({
    type: "service_request_created",
    priority,
    title: "Service Request Created",
    description: `A ${serviceType.toLowerCase()} service request has been created for ${patientName}`,
    patientId,
    metadata: { serviceType }
  }, user);
}

export async function createUrgentAlertActivity(
  patientId: string,
  patientName: string,
  alertReason: string,
  user: User | null = null
): Promise<ActivityFeedItem | null> {
  return createActivityFeedItem({
    type: "urgent_alert",
    priority: "urgent",
    title: "Urgent Alert",
    description: `Urgent attention required for ${patientName}: ${alertReason}`,
    patientId,
    metadata: { alertReason }
  }, user);
}

export async function createCarePlanUpdatedActivity(
  patientId: string,
  patientName: string,
  updateType: string,
  user: User | null = null
): Promise<ActivityFeedItem | null> {
  return createActivityFeedItem({
    type: "care_plan_updated",
    priority: "medium",
    title: "Care Plan Updated",
    description: `Care plan has been updated for ${patientName}: ${updateType}`,
    patientId,
    metadata: { updateType }
  }, user);
}
