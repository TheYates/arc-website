import { prisma } from "@/lib/database/postgresql";

interface ServiceCompletionData {
  serviceRequestId: string;
  patientId: string;
  caregiverId: string;
  serviceTitle: string;
  serviceDescription: string;
  outcome: string;
  caregiverNotes?: string;
  completedDate: Date;
  priority: string;
}

interface ScheduleCompletionData {
  scheduleId: string;
  patientId: string;
  caregiverId: string;
  scheduleTitle: string;
  scheduleType: string;
  outcome: string;
  completionNotes?: string;
  completedDate: Date;
  priority: string;
}

/**
 * Creates a care note when a service request is completed
 */
export async function createServiceCompletionCareNote(data: ServiceCompletionData) {
  try {
    const careNote = await prisma.careNote.create({
      data: {
        patientId: data.patientId,
        authorId: data.caregiverId,
        noteType: "GENERAL", // Could be more specific based on service type
        title: `Service Completed: ${data.serviceTitle}`,
        content: generateServiceCompletionContent(data),
        priority: data.priority as any,
        status: "SUBMITTED",
        tags: ["service_completion", "caregiver_visit"],
        isPrivate: false,
        followUpRequired: shouldRequireFollowUp(data),
        followUpDate: shouldRequireFollowUp(data) ? getFollowUpDate(data.completedDate) : null,
      },
    });

    console.log(`Care note created for service completion: ${careNote.id}`);
    return careNote;
  } catch (error) {
    console.error("Error creating service completion care note:", error);
    throw error;
  }
}

/**
 * Creates a care note when a caregiver schedule is completed
 */
export async function createScheduleCompletionCareNote(data: ScheduleCompletionData) {
  try {
    const careNote = await prisma.careNote.create({
      data: {
        patientId: data.patientId,
        authorId: data.caregiverId,
        noteType: getScheduleNoteType(data.scheduleType),
        title: `Visit Completed: ${data.scheduleTitle}`,
        content: generateScheduleCompletionContent(data),
        priority: data.priority as any,
        status: "SUBMITTED",
        tags: ["schedule_completion", "caregiver_visit", data.scheduleType.toLowerCase()],
        isPrivate: false,
        followUpRequired: shouldRequireScheduleFollowUp(data),
        followUpDate: shouldRequireScheduleFollowUp(data) ? getFollowUpDate(data.completedDate) : null,
      },
    });

    console.log(`Care note created for schedule completion: ${careNote.id}`);
    return careNote;
  } catch (error) {
    console.error("Error creating schedule completion care note:", error);
    throw error;
  }
}

/**
 * Updates an existing care note with service request information
 */
export async function linkServiceRequestToCareNote(serviceRequestId: string, careNoteId: string) {
  try {
    // Add service request reference to care note tags
    const careNote = await prisma.careNote.findUnique({
      where: { id: careNoteId },
    });

    if (!careNote) {
      throw new Error("Care note not found");
    }

    const updatedTags = [...careNote.tags, `service_request:${serviceRequestId}`];

    await prisma.careNote.update({
      where: { id: careNoteId },
      data: {
        tags: updatedTags,
      },
    });

    console.log(`Service request ${serviceRequestId} linked to care note ${careNoteId}`);
  } catch (error) {
    console.error("Error linking service request to care note:", error);
    throw error;
  }
}

/**
 * Retrieves care notes related to service requests for a patient
 */
export async function getServiceRelatedCareNotes(patientId: string) {
  try {
    const careNotes = await prisma.careNote.findMany({
      where: {
        patientId,
        OR: [
          { tags: { has: "service_completion" } },
          { tags: { has: "schedule_completion" } },
          { tags: { array_contains: ["service_request:"] } }, // Notes with service request references
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return careNotes;
  } catch (error) {
    console.error("Error retrieving service-related care notes:", error);
    throw error;
  }
}

// Helper functions

function generateServiceCompletionContent(data: ServiceCompletionData): string {
  let content = `Service Request Completed\n\n`;
  content += `Service: ${data.serviceTitle}\n`;
  content += `Description: ${data.serviceDescription}\n`;
  content += `Completed Date: ${data.completedDate.toLocaleString()}\n\n`;
  content += `Outcome:\n${data.outcome}\n\n`;
  
  if (data.caregiverNotes) {
    content += `Caregiver Notes:\n${data.caregiverNotes}\n\n`;
  }
  
  content += `This care note was automatically generated from a completed service request.`;
  
  return content;
}

function generateScheduleCompletionContent(data: ScheduleCompletionData): string {
  let content = `Scheduled Visit Completed\n\n`;
  content += `Visit Type: ${data.scheduleType.replace(/_/g, " ").toLowerCase()}\n`;
  content += `Title: ${data.scheduleTitle}\n`;
  content += `Completed Date: ${data.completedDate.toLocaleString()}\n\n`;
  content += `Outcome:\n${data.outcome}\n\n`;
  
  if (data.completionNotes) {
    content += `Visit Notes:\n${data.completionNotes}\n\n`;
  }
  
  content += `This care note was automatically generated from a completed scheduled visit.`;
  
  return content;
}

function getScheduleNoteType(scheduleType: string): string {
  switch (scheduleType) {
    case "MEDICATION":
      return "MEDICATION";
    case "THERAPY":
    case "ASSESSMENT":
      return "CARE_PLAN";
    case "EMERGENCY_VISIT":
      return "INCIDENT";
    default:
      return "GENERAL";
  }
}

function shouldRequireFollowUp(data: ServiceCompletionData): boolean {
  // Require follow-up for high/critical priority services or specific outcomes
  if (data.priority === "HIGH" || data.priority === "CRITICAL") {
    return true;
  }
  
  // Check if outcome indicates need for follow-up
  const followUpKeywords = ["follow-up", "monitor", "check", "reassess", "concern", "issue"];
  const outcomeText = data.outcome.toLowerCase();
  
  return followUpKeywords.some(keyword => outcomeText.includes(keyword));
}

function shouldRequireScheduleFollowUp(data: ScheduleCompletionData): boolean {
  // Require follow-up for certain schedule types
  const followUpScheduleTypes = ["ASSESSMENT", "EMERGENCY_VISIT"];
  if (followUpScheduleTypes.includes(data.scheduleType)) {
    return true;
  }
  
  // Check if outcome indicates need for follow-up
  const followUpKeywords = ["follow-up", "monitor", "check", "reassess", "concern", "issue"];
  const outcomeText = data.outcome.toLowerCase();
  
  return followUpKeywords.some(keyword => outcomeText.includes(keyword));
}

function getFollowUpDate(completedDate: Date): Date {
  // Default follow-up in 7 days
  const followUpDate = new Date(completedDate);
  followUpDate.setDate(followUpDate.getDate() + 7);
  return followUpDate;
}
