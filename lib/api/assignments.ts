import { Patient, AssignedStaff } from "../types/patients";
import { User } from "../auth";

// Get available staff for assignment (max 5 patients each)
export async function getAvailableStaff(): Promise<{
  caregivers: User[];
  reviewers: User[];
}> {
  // Get demo users (excluding patients)
  const demoUsers: User[] = [
    {
      id: "1",
      email: "admin@alpharescue.com",
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      phone: "+233 XX XXX XXXX",
      address: "Accra, Ghana",
      role: "admin",
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: true,
    },
    {
      id: "2",
      email: "dr.mensah@alpharescue.com",
      username: "drmensah",
      firstName: "Dr. Kwame",
      lastName: "Mensah",
      phone: "+233 XX XXX XXXX",
      address: "Kumasi, Ghana",
      role: "reviewer",
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: false,
    },
    {
      id: "3",
      email: "ama.nurse@alpharescue.com",
      username: "nurseama",
      firstName: "Ama",
      lastName: "Asante",
      phone: "+233 XX XXX XXXX",
      address: "Tema, Ghana",
      role: "care_giver",
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileComplete: true,
    },
  ];

  // Get created users from localStorage (excluding patients)
  const createdUsersData = localStorage.getItem("auth_users");
  let createdUsers: User[] = [];

  if (createdUsersData) {
    try {
      const userAccounts = JSON.parse(createdUsersData);
      createdUsers = userAccounts
        .map((account: any) => account.user)
        .filter((user: User) => user.role !== "patient");
    } catch (error) {
      console.error("Error loading created users:", error);
    }
  }

  // Combine all users
  const allUsers = [...demoUsers, ...createdUsers];

  // Get current assignments to calculate workload
  const patients = await getCurrentPatients();
  const workloadCount: Record<string, number> = {};

  patients.forEach((patient) => {
    if (patient.assignedCaregiverId) {
      workloadCount[patient.assignedCaregiverId] =
        (workloadCount[patient.assignedCaregiverId] || 0) + 1;
    }
    if (patient.assignedReviewerId) {
      workloadCount[patient.assignedReviewerId] =
        (workloadCount[patient.assignedReviewerId] || 0) + 1;
    }
  });

  // Filter available staff (under 5 patients)
  const caregivers = allUsers
    .filter((user) => user.role === "care_giver")
    .filter((user) => (workloadCount[user.id] || 0) < 5);

  const reviewers = allUsers
    .filter((user) => user.role === "reviewer")
    .filter((user) => (workloadCount[user.id] || 0) < 5);

  return { caregivers, reviewers };
}

// Get current patients (this would import from patients.ts, but avoiding circular imports)
async function getCurrentPatients(): Promise<Patient[]> {
  try {
    const patientsData = localStorage.getItem("patients_data");
    if (patientsData) {
      return JSON.parse(patientsData);
    }
  } catch (error) {
    console.error("Error loading patients:", error);
  }
  return [];
}

// Assign patient to caregiver
export async function assignPatientToCaregiver(
  patientId: string,
  caregiverId: string,
  assignedBy: string
): Promise<boolean> {
  try {
    const patients = await getCurrentPatients();
    const patientIndex = patients.findIndex((p) => p.id === patientId);

    if (patientIndex === -1) {
      throw new Error("Patient not found");
    }

    // Get caregiver info
    const staff = await getAvailableStaff();
    const caregiver = [...staff.caregivers].find((c) => c.id === caregiverId);

    if (!caregiver) {
      throw new Error("Caregiver not available or at capacity");
    }

    // Update patient with assignment
    patients[patientIndex].assignedCaregiverId = caregiverId;
    patients[patientIndex].assignedCaregiver = {
      id: caregiver.id,
      name: `${caregiver.firstName} ${caregiver.lastName}`,
      email: caregiver.email,
      assignedAt: new Date().toISOString(),
      assignedBy: assignedBy,
    };

    // Save to localStorage
    localStorage.setItem("patients_data", JSON.stringify(patients));

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
    const patients = await getCurrentPatients();
    const patientIndex = patients.findIndex((p) => p.id === patientId);

    if (patientIndex === -1) {
      throw new Error("Patient not found");
    }

    // Get reviewer info
    const staff = await getAvailableStaff();
    const reviewer = [...staff.reviewers].find((r) => r.id === reviewerId);

    if (!reviewer) {
      throw new Error("Reviewer not available or at capacity");
    }

    // Update patient with assignment
    patients[patientIndex].assignedReviewerId = reviewerId;
    patients[patientIndex].assignedReviewer = {
      id: reviewer.id,
      name: `${reviewer.firstName} ${reviewer.lastName}`,
      email: reviewer.email,
      assignedAt: new Date().toISOString(),
      assignedBy: assignedBy,
    };

    // Save to localStorage
    localStorage.setItem("patients_data", JSON.stringify(patients));

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
    const patients = await getCurrentPatients();
    const patientIndex = patients.findIndex((p) => p.id === patientId);

    if (patientIndex === -1) {
      return false;
    }

    if (type === "caregiver") {
      patients[patientIndex].assignedCaregiverId = undefined;
      patients[patientIndex].assignedCaregiver = undefined;
    } else {
      patients[patientIndex].assignedReviewerId = undefined;
      patients[patientIndex].assignedReviewer = undefined;
    }

    localStorage.setItem("patients_data", JSON.stringify(patients));
    return true;
  } catch (error) {
    console.error("Error removing assignment:", error);
    return false;
  }
}

// Get patients assigned to a specific caregiver
export async function getPatientsByCaregiver(
  caregiverId: string
): Promise<Patient[]> {
  const patients = await getCurrentPatients();
  return patients.filter((p) => p.assignedCaregiverId === caregiverId);
}

// Get patients assigned to a specific reviewer
export async function getPatientsByReviewer(
  reviewerId: string
): Promise<Patient[]> {
  const patients = await getCurrentPatients();
  return patients.filter((p) => p.assignedReviewerId === reviewerId);
}

// Get workload statistics
export async function getWorkloadStats(): Promise<{
  caregivers: Array<{ user: User; patientCount: number }>;
  reviewers: Array<{ user: User; patientCount: number }>;
}> {
  const staff = await getAvailableStaff();
  const patients = await getCurrentPatients();

  // Count assignments
  const caregiverStats = staff.caregivers.map((caregiver) => ({
    user: caregiver,
    patientCount: patients.filter((p) => p.assignedCaregiverId === caregiver.id)
      .length,
  }));

  const reviewerStats = staff.reviewers.map((reviewer) => ({
    user: reviewer,
    patientCount: patients.filter((p) => p.assignedReviewerId === reviewer.id)
      .length,
  }));

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
    const patients = await getCurrentPatients();
    const patient = patients.find((p) => p.id === patientId);

    if (!patient) return;

    const notification = {
      id: `assign_${Date.now()}`,
      recipientId: staffId,
      type: "assignment",
      title: `New Patient Assignment`,
      message: `You have been assigned to patient ${patient.firstName} ${patient.lastName}`,
      data: {
        patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        assignedBy,
        staffType,
      },
      createdAt: new Date().toISOString(),
      read: false,
    };

    // Save notification to localStorage
    const existingNotifications = JSON.parse(
      localStorage.getItem("notifications") || "[]"
    );
    existingNotifications.push(notification);
    localStorage.setItem(
      "notifications",
      JSON.stringify(existingNotifications)
    );

    // Assignment notification sent successfully
  } catch (error) {
    console.error("Error creating assignment notification:", error);
  }
}
