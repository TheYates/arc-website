import {
  CareerApplication,
  ApplicationStatus,
  JobPosition,
  JobStatus,
} from "../types/careers";
import { User } from "../auth";
import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  authenticatedDelete,
} from "./auth-headers";

// Job Categories API
export async function getJobCategories(
  user: User | null = null
): Promise<string[]> {
  try {
    const response = await authenticatedGet("/api/careers/categories", user);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const data = await response.json();
    return data.categories.map((cat: any) => cat.name);
  } catch (error) {
    console.error("Error fetching job categories:", error);
    return [];
  }
}

export async function createJobCategory(
  name: string,
  user: User | null = null
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await authenticatedPost("/api/careers/categories", user, {
      name,
      description: `${name} related positions`,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to create category",
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create category" };
  }
}

export async function deleteJobCategory(
  name: string,
  user: User | null = null
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // First get the category ID by name
    const response = await authenticatedGet("/api/careers/categories", user);
    if (!response.ok) {
      return { success: false, error: "Failed to fetch categories" };
    }

    const data = await response.json();
    const category = data.categories.find((cat: any) => cat.name === name);

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    const deleteResponse = await authenticatedDelete(
      `/api/careers/categories/${category.id}`,
      user
    );

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      return {
        success: false,
        error: errorData.error || "Failed to delete category",
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete category" };
  }
}

// Job Positions API
export async function getJobPositions(
  user: User | null = null
): Promise<JobPosition[]> {
  try {
    const response = await authenticatedGet("/api/careers/positions", user);
    if (!response.ok) {
      throw new Error("Failed to fetch job positions");
    }
    const data = await response.json();

    // Transform database format to expected format
    return data.positions.map((pos: any) => ({
      id: pos.id,
      title: pos.title,
      category: pos.category.name,
      description: pos.description,
      requirements: pos.requirements,
      responsibilities: pos.responsibilities || [],
      location: pos.location,
      employmentType: pos.employmentType,
      status: pos.status.toLowerCase(),
      applicationDeadline: pos.applicationDeadline,
      type:
        pos.employmentType === "FULL_TIME"
          ? "Full-time"
          : pos.employmentType === "PART_TIME"
          ? "Part-time"
          : pos.employmentType,
      numberOfPositions: 1, // Default value
      remoteWorkOptions: pos.isRemote
        ? "Remote work available"
        : "No remote work",
      benefits: [], // Default empty array
      createdAt: pos.createdAt,
      updatedAt: pos.updatedAt,
      createdBy: `${pos.createdBy.firstName} ${pos.createdBy.lastName}`,
    }));
  } catch (error) {
    console.error("Error fetching job positions:", error);
    return [];
  }
}

// Get published job positions (public API - no authentication required)
export async function getPublishedJobPositions(): Promise<JobPosition[]> {
  try {
    const response = await fetch("/api/careers/positions?status=ACTIVE");
    if (!response.ok) {
      throw new Error("Failed to fetch published job positions");
    }
    const data = await response.json();

    // Transform database format to expected format
    return data.positions.map((pos: any) => ({
      id: pos.id,
      title: pos.title,
      category: pos.category.name,
      description: pos.description,
      requirements: pos.requirements,
      responsibilities: pos.responsibilities || [],
      location: pos.location,
      employmentType: pos.employmentType,
      status: pos.status.toLowerCase(),
      applicationDeadline: pos.applicationDeadline,
      type:
        pos.employmentType === "FULL_TIME"
          ? "Full-time"
          : pos.employmentType === "PART_TIME"
          ? "Part-time"
          : pos.employmentType,
      numberOfPositions: 1, // Default value
      remoteWorkOptions: pos.isRemote
        ? "Remote work available"
        : "No remote work",
      benefits: [], // Default empty array
      createdAt: pos.createdAt,
      updatedAt: pos.updatedAt,
      createdBy: `${pos.createdBy.firstName} ${pos.createdBy.lastName}`,
    }));
  } catch (error) {
    console.error("Error fetching published job positions:", error);
    return [];
  }
}

// Get job position by ID
export async function getJobPositionById(
  id: string,
  user: User | null = null
): Promise<JobPosition | null> {
  try {
    const response = await authenticatedGet(
      `/api/careers/positions/${id}`,
      user
    );
    if (!response.ok) {
      throw new Error("Failed to fetch job position");
    }
    const data = await response.json();

    if (!data.position) {
      return null;
    }

    const pos = data.position;
    return {
      id: pos.id,
      title: pos.title,
      category: pos.category.name,
      description: pos.description,
      requirements: pos.requirements,
      responsibilities: pos.responsibilities || [],
      location: pos.location,
      employmentType: pos.employmentType,
      status: pos.status.toLowerCase(),
      applicationDeadline: pos.applicationDeadline,
      type:
        pos.employmentType === "FULL_TIME"
          ? "Full-time"
          : pos.employmentType === "PART_TIME"
          ? "Part-time"
          : pos.employmentType === "CONTRACT"
          ? "Contract"
          : pos.employmentType === "TEMPORARY"
          ? "Temporary"
          : pos.employmentType === "INTERNSHIP"
          ? "Internship"
          : pos.employmentType,
      numberOfPositions: 1, // Default value
      remoteWorkOptions: pos.isRemote
        ? "Remote work available"
        : "No remote work",
      benefits: [], // Default empty array
      createdAt: pos.createdAt,
      updatedAt: pos.updatedAt,
      createdBy: pos.createdBy
        ? `${pos.createdBy.firstName} ${pos.createdBy.lastName}`
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching job position:", error);
    return null;
  }
}

export async function createJobPosition(
  position: Omit<JobPosition, "id" | "createdAt" | "updatedAt" | "createdBy">,
  user: User | null = null
): Promise<{ success: boolean; error?: string; position?: JobPosition }> {
  try {
    // Get category ID by name
    const categoriesResponse = await authenticatedGet(
      "/api/careers/categories",
      user
    );
    if (!categoriesResponse.ok) {
      return { success: false, error: "Failed to fetch categories" };
    }

    const categoriesData = await categoriesResponse.json();
    const category = categoriesData.categories.find(
      (cat: any) => cat.name === position.category
    );

    if (!category) {
      return { success: false, error: "Invalid category" };
    }

    const response = await authenticatedPost("/api/careers/positions", user, {
      title: position.title,
      categoryId: category.id,
      description: position.description,
      requirements: position.requirements,
      responsibilities: position.responsibilities,
      location: position.location,
      employmentType: position.employmentType?.toUpperCase() || "FULL_TIME",
      isRemote: position.remoteWorkOptions?.includes("Remote") || false,
      experienceLevel: "MID_LEVEL",
      applicationDeadline: position.applicationDeadline
        ? new Date(position.applicationDeadline)
        : null,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to create position",
      };
    }

    const data = await response.json();

    // Transform back to expected format
    const createdPosition: JobPosition = {
      id: data.position.id,
      title: data.position.title,
      category: data.position.category.name,
      description: data.position.description,
      requirements: data.position.requirements,
      responsibilities: data.position.responsibilities || [],
      location: data.position.location,
      employmentType: data.position.employmentType,
      status: data.position.status.toLowerCase(),
      applicationDeadline: data.position.applicationDeadline,
      type:
        data.position.employmentType === "FULL_TIME"
          ? "Full-time"
          : data.position.employmentType === "PART_TIME"
          ? "Part-time"
          : data.position.employmentType,
      numberOfPositions: 1,
      remoteWorkOptions: data.position.isRemote
        ? "Remote work available"
        : "No remote work",
      benefits: [],
      createdAt: data.position.createdAt,
      updatedAt: data.position.updatedAt,
      createdBy: `${data.position.createdBy.firstName} ${data.position.createdBy.lastName}`,
    };

    return { success: true, position: createdPosition };
  } catch (error) {
    return { success: false, error: "Failed to create position" };
  }
}

export async function updateJobPosition(
  position: JobPosition,
  user: User | null = null
): Promise<{ success: boolean; error?: string; position?: JobPosition }> {
  try {
    // Get category ID by name
    const categoriesResponse = await authenticatedGet(
      "/api/careers/categories",
      user
    );
    if (!categoriesResponse.ok) {
      return { success: false, error: "Failed to fetch categories" };
    }

    const categoriesData = await categoriesResponse.json();
    const category = categoriesData.categories.find(
      (cat: any) => cat.name === position.category
    );

    if (!category) {
      return { success: false, error: "Invalid category" };
    }

    const response = await authenticatedPut(
      `/api/careers/positions/${position.id}`,
      user,
      {
        title: position.title,
        categoryId: category.id,
        description: position.description,
        requirements: position.requirements,
        responsibilities: position.responsibilities,
        location: position.location,
        employmentType: position.employmentType?.toUpperCase() || "FULL_TIME",
        status: position.status?.toUpperCase() || "ACTIVE",
        isRemote: position.remoteWorkOptions?.includes("Remote") || false,
        applicationDeadline: position.applicationDeadline
          ? new Date(position.applicationDeadline)
          : null,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to update position",
      };
    }

    const data = await response.json();

    // Transform back to expected format
    const updatedPosition: JobPosition = {
      id: data.position.id,
      title: data.position.title,
      category: data.position.category.name,
      description: data.position.description,
      requirements: data.position.requirements,
      responsibilities: data.position.responsibilities || [],
      location: data.position.location,
      employmentType: data.position.employmentType,
      status: data.position.status.toLowerCase(),
      applicationDeadline: data.position.applicationDeadline,
      type:
        data.position.employmentType === "FULL_TIME"
          ? "Full-time"
          : data.position.employmentType === "PART_TIME"
          ? "Part-time"
          : data.position.employmentType,
      numberOfPositions: 1,
      remoteWorkOptions: data.position.isRemote
        ? "Remote work available"
        : "No remote work",
      benefits: [],
      createdAt: data.position.createdAt,
      updatedAt: data.position.updatedAt,
      createdBy: `${data.position.createdBy.firstName} ${data.position.createdBy.lastName}`,
    };

    return { success: true, position: updatedPosition };
  } catch (error) {
    return { success: false, error: "Failed to update position" };
  }
}

export async function deleteJobPosition(
  id: string,
  user: User | null = null
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await authenticatedDelete(
      `/api/careers/positions/${id}`,
      user
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to delete position",
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete position" };
  }
}

// Career Applications API
export async function getCareerApplications(
  user: User | null = null
): Promise<CareerApplication[]> {
  try {
    const response = await authenticatedGet("/api/careers/applications", user);
    if (!response.ok) {
      throw new Error("Failed to fetch career applications");
    }
    const data = await response.json();

    // Transform database format to expected format
    return data.applications.map((app: any) => ({
      id: app.id,
      jobId: app.jobPositionId,
      jobTitle: app.jobPosition.title,
      applicantName: `${app.firstName} ${app.lastName}`,
      email: app.email,
      phone: app.phone,
      appliedDate: app.appliedAt,
      status: app.status.toLowerCase(),
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter,
      experience: app.workExperience,
      education: app.education,
      skills: app.skills,
      // Additional fields from database
      firstName: app.firstName,
      lastName: app.lastName,
      address: app.address,
      dateOfBirth: app.dateOfBirth,
      nationality: app.nationality,
      certifications: app.certifications,
      languages: app.languages,
      portfolioUrl: app.portfolioUrl,
      linkedinUrl: app.linkedinUrl,
      references: app.references,
      availableStartDate: app.availableStartDate,
      adminNotes: app.adminNotes,
      interviewDate: app.interviewDate,
      interviewType: app.interviewType,
      interviewNotes: app.interviewNotes,
      reviewedAt: app.reviewedAt,
      reviewedBy: app.reviewedBy
        ? `${app.reviewedBy.firstName} ${app.reviewedBy.lastName}`
        : null,
    }));
  } catch (error) {
    console.error("Error fetching career applications:", error);
    return [];
  }
}

export async function getCareerApplicationById(
  id: string,
  user: User | null = null
): Promise<CareerApplication | null> {
  try {
    const response = await authenticatedGet(
      `/api/careers/applications/${id}`,
      user
    );
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch career application");
    }
    const data = await response.json();
    const app = data.application;

    return {
      id: app.id,
      jobId: app.jobPositionId,
      jobTitle: app.jobPosition.title,
      applicantName: `${app.firstName} ${app.lastName}`,
      email: app.email,
      phone: app.phone,
      appliedDate: app.appliedAt,
      submittedAt: app.appliedAt,
      status: app.status.toLowerCase(),
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter,
      experience: app.workExperience,
      education: app.education,
      skills: app.skills,
      // Additional fields
      firstName: app.firstName,
      lastName: app.lastName,
      address: app.address,
      dateOfBirth: app.dateOfBirth,
      nationality: app.nationality,
      certifications: app.certifications,
      languages: app.languages,
      portfolioUrl: app.portfolioUrl,
      linkedinUrl: app.linkedinUrl,
      references: app.references,
      availableStartDate: app.availableStartDate,
      adminNotes: app.adminNotes,
      interviewDate: app.interviewDate,
      interviewType: app.interviewType,
      interviewNotes: app.interviewNotes,
      reviewedAt: app.reviewedAt,
      reviewedBy: app.reviewedBy
        ? `${app.reviewedBy.firstName} ${app.reviewedBy.lastName}`
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching career application:", error);
    return null;
  }
}

// Create career application (public API - no authentication required)
export async function createCareerApplication(application: {
  jobPositionId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  coverLetter?: string;
}): Promise<{
  success: boolean;
  error?: string;
  application?: CareerApplication;
}> {
  try {
    const response = await fetch("/api/careers/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(application),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to submit application",
      };
    }

    const data = await response.json();
    return { success: true, application: data.application };
  } catch (error) {
    console.error("Error creating career application:", error);
    return { success: false, error: "Failed to submit application" };
  }
}

export async function updateCareerApplicationStatus(
  id: string,
  status: ApplicationStatus,
  adminNotes?: string,
  reviewedBy?: string,
  interviewDate?: string,
  user: User | null = null
): Promise<CareerApplication | null> {
  try {
    const response = await authenticatedPut(
      `/api/careers/applications/${id}`,
      user,
      {
        status: status.toUpperCase(),
        adminNotes,
        ...(interviewDate && { interviewDate }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update application status");
    }

    const data = await response.json();
    const app = data.application;

    return {
      id: app.id,
      jobId: app.jobPositionId,
      jobTitle: app.jobPosition.title,
      applicantName: `${app.firstName} ${app.lastName}`,
      email: app.email,
      phone: app.phone,
      appliedDate: app.appliedAt,
      submittedAt: app.appliedAt,
      status: app.status.toLowerCase(),
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter,
      experience: app.workExperience,
      education: app.education,
      skills: app.skills,
      firstName: app.firstName,
      lastName: app.lastName,
      address: app.address,
      dateOfBirth: app.dateOfBirth,
      nationality: app.nationality,
      certifications: app.certifications,
      languages: app.languages,
      portfolioUrl: app.portfolioUrl,
      linkedinUrl: app.linkedinUrl,
      references: app.references,
      availableStartDate: app.availableStartDate,
      adminNotes: app.adminNotes,
      interviewDate: app.interviewDate,
      interviewType: app.interviewType,
      interviewNotes: app.interviewNotes,
      reviewedAt: app.reviewedAt,
      reviewedBy: app.reviewedBy
        ? `${app.reviewedBy.firstName} ${app.reviewedBy.lastName}`
        : undefined,
    };
  } catch (error) {
    console.error("Error updating application status:", error);
    return null;
  }
}
