import { prisma } from "@/lib/database/postgresql";
import { User } from "@/lib/auth";

/**
 * Trigger activity feed items for various system events
 * These functions should be called after successful database operations
 */

export async function triggerCareNoteCreated(
  patientId: string,
  patientName: string,
  noteType: string,
  user: User
) {
  try {
    await prisma.activityFeed.create({
      data: {
        type: "CARE_NOTE_CREATED",
        priority: "MEDIUM",
        title: "New Care Note Added",
        description: `A ${noteType.toLowerCase()} care note has been added for ${patientName}`,
        patientId,
        createdById: user.id,
        metadata: { noteType }
      }
    });
    console.log("✅ Care note activity created successfully");
  } catch (error) {
    console.error("Failed to create care note activity:", error);
    // Don't throw - activity feed failures shouldn't break main functionality
  }
}

export async function triggerMedicalReviewCreated(
  patientId: string,
  patientName: string,
  reviewType: string,
  user: User
) {
  try {
    await createMedicalReviewActivity(patientId, patientName, reviewType, user);
  } catch (error) {
    console.error("Failed to create medical review activity:", error);
  }
}

export async function triggerMedicationPrescribed(
  patientId: string,
  patientName: string,
  medicationNames: string[],
  user: User
) {
  try {
    // Create activity for each medication prescribed
    for (const medicationName of medicationNames) {
      await createMedicationPrescribedActivity(patientId, patientName, medicationName, user);
    }
  } catch (error) {
    console.error("Failed to create medication prescribed activity:", error);
  }
}

export async function triggerMedicationAdministered(
  patientId: string,
  patientName: string,
  medicationName: string,
  dosage: string,
  user: User
) {
  try {
    await prisma.activityFeed.create({
      data: {
        type: "MEDICATION_ADMINISTERED",
        priority: "MEDIUM",
        title: "Medication Administered",
        description: `${medicationName} (${dosage}) has been administered to ${patientName}`,
        patientId,
        createdById: user.id,
        metadata: { medicationName, dosage }
      }
    });
    console.log("✅ Medication administration activity created successfully");
  } catch (error) {
    console.error("Failed to create medication administered activity:", error);
  }
}

export async function triggerVitalSignsRecorded(
  patientId: string,
  patientName: string,
  vitalTypes: string[],
  user: User
) {
  try {
    await createVitalSignsActivity(patientId, patientName, vitalTypes, user);
  } catch (error) {
    console.error("Failed to create vital signs activity:", error);
  }
}

export async function triggerPatientAssigned(
  patientId: string,
  patientName: string,
  assigneeRole: "caregiver" | "reviewer",
  assigneeName: string,
  user: User
) {
  try {
    await createPatientAssignedActivity(patientId, patientName, assigneeRole, assigneeName, user);
  } catch (error) {
    console.error("Failed to create patient assigned activity:", error);
  }
}

export async function triggerServiceRequestCreated(
  patientId: string,
  patientName: string,
  serviceType: string,
  priority: "low" | "medium" | "high" | "urgent" = "medium",
  user: User
) {
  try {
    await createServiceRequestActivity(patientId, patientName, serviceType, priority, user);
  } catch (error) {
    console.error("Failed to create service request activity:", error);
  }
}

export async function triggerUrgentAlert(
  patientId: string,
  patientName: string,
  alertReason: string,
  user: User
) {
  try {
    await createUrgentAlertActivity(patientId, patientName, alertReason, user);
  } catch (error) {
    console.error("Failed to create urgent alert activity:", error);
  }
}

export async function triggerCarePlanUpdated(
  patientId: string,
  patientName: string,
  updateType: string,
  user: User
) {
  try {
    await createCarePlanUpdatedActivity(patientId, patientName, updateType, user);
  } catch (error) {
    console.error("Failed to create care plan updated activity:", error);
  }
}

// Helper function to get patient name from ID
export async function getPatientName(patientId: string): Promise<string> {
  try {
    const response = await fetch(`/api/patients/${patientId}`);
    if (response.ok) {
      const patient = await response.json();
      return `${patient.firstName} ${patient.lastName}`;
    }
    return "Unknown Patient";
  } catch (error) {
    console.error("Failed to get patient name:", error);
    return "Unknown Patient";
  }
}

// Batch trigger for multiple activities
export async function triggerMultipleActivities(
  triggers: Array<() => Promise<void>>
) {
  // Execute all triggers in parallel, but don't let failures stop the process
  await Promise.allSettled(triggers.map(trigger => trigger()));
}
