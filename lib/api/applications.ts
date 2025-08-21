import {
  ApplicationData,
  ApplicationStatus,
  CreateApplicationData,
} from "../types/applications";
import { User } from "../auth";
import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
} from "./auth-headers";

export async function getApplications(
  user: User | null = null
): Promise<ApplicationData[]> {
  try {
    const response = await authenticatedGet("/api/admin/applications", user);
    if (!response.ok) {
      throw new Error("Failed to fetch applications");
    }
    const data = await response.json();
    return data.applications || [];
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
}

export async function getApplicationById(
  id: string
): Promise<ApplicationData | null> {
  try {
    const response = await fetch(`/api/admin/applications/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch application");
    }
    const data = await response.json();
    return data.application || null;
  } catch (error) {
    console.error("Error fetching application:", error);
    return null;
  }
}

export async function createApplication(
  data: CreateApplicationData
): Promise<ApplicationData | null> {
  try {
    const response = await fetch("/api/admin/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create application");
    }

    const result = await response.json();
    return result.application || null;
  } catch (error) {
    console.error("Error creating application:", error);
    return null;
  }
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  adminNotes?: string,
  processedBy?: string
): Promise<ApplicationData | null> {
  try {
    const response = await fetch(`/api/admin/applications/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        adminNotes,
        processedBy,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update application status");
    }

    const data = await response.json();
    return data.application || null;
  } catch (error) {
    console.error("Error updating application status:", error);
    return null;
  }
}
