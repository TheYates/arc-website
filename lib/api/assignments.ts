import { Patient } from "../types/patients";
import { User } from "../auth";

// Get available staff for assignment from database
export async function getAvailableStaff(): Promise<{
  caregivers: User[];
  reviewers: User[];
}> {
  try {
    const response = await fetch('/api/admin/staff');
    
    if (!response.ok) {
      throw new Error(`Staff API failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      caregivers: data.caregivers || [],
      reviewers: data.reviewers || [],
    };
  } catch (error) {
    console.error('Error fetching available staff:', error);
    
    // Return empty arrays as fallback
    return {
      caregivers: [],
      reviewers: [],
    };
  }
}



// Assign patient to caregiver
export async function assignPatientToCaregiver(
  patientId: string,
  caregiverId: string,
  assignedBy: string
): Promise<boolean> {
  try {
    // Use the API endpoint for consistency
    const response = await fetch('/api/admin/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, caregiverId, type: 'caregiver' })
    });

    if (!response.ok) {
      throw new Error(`Assignment API failed: ${response.status}`);
    }

    // Create notification
    await createAssignmentNotification(
      patientId,
      caregiverId,
      "caregiver",
      assignedBy
    );

    return true;
  } catch (error) {
    console.error("Error assigning patient to caregiver:", error);
    return false;
  }
}

// Assign patient to reviewer
export async function assignPatientToReviewer(
  patientId: string,
  reviewerId: string,
  assignedBy: string
): Promise<boolean> {
  try {
    // Use the API endpoint for consistency
    const response = await fetch('/api/admin/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, reviewerId, type: 'reviewer' })
    });

    if (!response.ok) {
      throw new Error(`Assignment API failed: ${response.status}`);
    }

    // Create notification
    await createAssignmentNotification(
      patientId,
      reviewerId,
      "reviewer",
      assignedBy
    );

    return true;
  } catch (error) {
    console.error("Error assigning patient to reviewer:", error);
    return false;
  }
}

// Remove assignment
export async function removeAssignment(
  patientId: string,
  type: "caregiver" | "reviewer"
): Promise<boolean> {
  try {
    if (type === "caregiver") {
      // Create API call to remove all caregiver assignments for this patient
      const response = await fetch(`/api/admin/assignments/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, type: 'caregiver' })
      });
      return response.ok;
    } else if (type === "reviewer") {
      // Create API call to remove reviewer assignments for this patient
      const response = await fetch(`/api/admin/assignments/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, type: 'reviewer' })
      });
      return response.ok;
    }
    
    return false; // Default case
  } catch (error) {
    console.error("Error removing assignment:", error);
    return false;
  }
}

// Get patients assigned to a specific caregiver
export async function getPatientsByCaregiver(
  caregiverId: string
): Promise<Patient[]> {
  try {
    const response = await fetch(`/api/patients/caregiver/${caregiverId}`);

    if (!response.ok) {
      throw new Error(`Caregiver patients API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.patients || [];
  } catch (error) {
    console.error('Error fetching patients by caregiver:', error);
    return [];
  }
}

// Get patients assigned to a specific reviewer
export async function getPatientsByReviewer(
  reviewerId: string
): Promise<Patient[]> {
  try {
    const response = await fetch(`/api/patients/reviewer/${reviewerId}`);

    if (!response.ok) {
      throw new Error(`Reviewer patients API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.patients || [];
  } catch (error) {
    console.error('Error fetching patients by reviewer:', error);
    return [];
  }
}

// Get workload statistics
export async function getWorkloadStats(): Promise<{
  caregivers: Array<{ user: User; patientCount: number }>;
  reviewers: Array<{ user: User; patientCount: number }>;
}> {
  const staff = await getAvailableStaff();

  // Get patient counts for each caregiver
  const caregiverStats = await Promise.all(
    staff.caregivers.map(async (caregiver) => {
      const patients = await getPatientsByCaregiver(caregiver.id);
      return {
        user: caregiver,
        patientCount: patients.length,
      };
    })
  );

  // Get patient counts for each reviewer
  const reviewerStats = await Promise.all(
    staff.reviewers.map(async (reviewer) => {
      const patients = await getPatientsByReviewer(reviewer.id);
      return {
        user: reviewer,
        patientCount: patients.length,
      };
    })
  );

  return {
    caregivers: caregiverStats,
    reviewers: reviewerStats,
  };
}

// Create assignment notification
async function createAssignmentNotification(
  patientId: string,
  staffId: string,
  staffType: "caregiver" | "reviewer",
  assignedBy: string
): Promise<void> {
  try {
    // TODO: Implement proper notification system with database
    console.log(`Assignment notification: ${staffType} ${staffId} assigned to patient ${patientId} by ${assignedBy}`);
  } catch (error) {
    console.error("Error creating assignment notification:", error);
  }
}
