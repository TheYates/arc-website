import { v4 as uuidv4 } from "uuid";
import {
  CareerApplication,
  ApplicationStatus,
  JobPosition,
  JobStatus,
} from "../types/careers";

// Storage keys
const JOBS_STORAGE_KEY = "arc_job_positions";
const CATEGORIES_STORAGE_KEY = "arc_job_categories";
const APPLICATIONS_STORAGE_KEY = "arc_career_applications";

// Default categories
const DEFAULT_CATEGORIES = [
  "Healthcare",
  "Childcare",
  "Event Medical",
  "Administrative",
  "Other",
];

// Utility functions for localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Initialize default data if not exists
function initializeDefaultData() {
  const existingJobs = getFromStorage<JobPosition[]>(JOBS_STORAGE_KEY, []);
  const existingCategories = getFromStorage<string[]>(
    CATEGORIES_STORAGE_KEY,
    []
  );

  if (existingCategories.length === 0) {
    saveToStorage(CATEGORIES_STORAGE_KEY, DEFAULT_CATEGORIES);
  }

  if (existingJobs.length === 0) {
    const defaultJobs: JobPosition[] = [
      {
        id: uuidv4(),
        title: "Live-in Care Specialist",
        type: "Full-time",
        location: "Accra, Ghana",
        description:
          "Provide comprehensive 24/7 home care services to families in need. Work closely with families to ensure comfort and quality care.",
        requirements: [
          "Nursing certification",
          "2+ years experience",
          "Excellent communication skills",
          "Compassionate nature",
        ],
        salary: "GHS 2,500 - 3,500/month",
        category: "Healthcare",
        status: "published",
        numberOfPositions: 3,
        remoteWorkOptions: "No remote work",
        benefits: [
          "Health insurance",
          "Performance bonus",
          "Professional development",
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "admin",
      },
      {
        id: uuidv4(),
        title: "Professional Nanny",
        type: "Full-time / Part-time",
        location: "Greater Accra",
        description:
          "Care for children with love, patience, and professional expertise. Support child development and educational activities.",
        requirements: [
          "Childcare certification",
          "First aid training",
          "References required",
          "Educational background",
        ],
        salary: "GHS 1,800 - 2,800/month",
        category: "Childcare",
        status: "published",
        numberOfPositions: 5,
        remoteWorkOptions: "Hybrid options available",
        benefits: [
          "Flexible schedule",
          "Training allowance",
          "Transport allowance",
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "admin",
      },
    ];

    saveToStorage(JOBS_STORAGE_KEY, defaultJobs);
  }
}

// Job Categories API
export async function getJobCategories(): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const categories = getFromStorage<string[]>(
        CATEGORIES_STORAGE_KEY,
        DEFAULT_CATEGORIES
      );
      resolve(categories);
    }, 200);
  });
}

export async function createJobCategory(category: string): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const categories = getFromStorage<string[]>(
        CATEGORIES_STORAGE_KEY,
        DEFAULT_CATEGORIES
      );
      if (!categories.includes(category)) {
        categories.push(category);
        saveToStorage(CATEGORIES_STORAGE_KEY, categories);
      }
      resolve(categories);
    }, 300);
  });
}

export async function deleteJobCategory(category: string): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const categories = getFromStorage<string[]>(
        CATEGORIES_STORAGE_KEY,
        DEFAULT_CATEGORIES
      );
      const filtered = categories.filter((c) => c !== category);
      saveToStorage(CATEGORIES_STORAGE_KEY, filtered);
      resolve(filtered);
    }, 300);
  });
}

// Job Positions API
export async function getJobPositions(): Promise<JobPosition[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      initializeDefaultData();
      const jobs = getFromStorage<JobPosition[]>(JOBS_STORAGE_KEY, []);
      resolve(jobs);
    }, 300);
  });
}

export async function getPublishedJobPositions(): Promise<JobPosition[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      initializeDefaultData();
      const jobs = getFromStorage<JobPosition[]>(JOBS_STORAGE_KEY, []);
      const publishedJobs = jobs.filter((job) => job.status === "published");
      resolve(publishedJobs);
    }, 300);
  });
}

export async function getJobPositionById(
  id: string
): Promise<JobPosition | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      initializeDefaultData();
      const jobs = getFromStorage<JobPosition[]>(JOBS_STORAGE_KEY, []);
      const job = jobs.find((j) => j.id === id);
      resolve(job || null);
    }, 200);
  });
}

export async function createJobPosition(
  jobData: Omit<JobPosition, "id" | "createdAt" | "updatedAt">
): Promise<JobPosition> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const jobs = getFromStorage<JobPosition[]>(JOBS_STORAGE_KEY, []);

      const newJob: JobPosition = {
        id: uuidv4(),
        ...jobData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jobs.push(newJob);
      saveToStorage(JOBS_STORAGE_KEY, jobs);
      resolve(newJob);
    }, 500);
  });
}

export async function updateJobPosition(
  id: string,
  updates: Partial<Omit<JobPosition, "id" | "createdAt">>
): Promise<JobPosition | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const jobs = getFromStorage<JobPosition[]>(JOBS_STORAGE_KEY, []);
      const index = jobs.findIndex((j) => j.id === id);

      if (index === -1) {
        resolve(null);
        return;
      }

      const updatedJob = {
        ...jobs[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      jobs[index] = updatedJob;
      saveToStorage(JOBS_STORAGE_KEY, jobs);
      resolve(updatedJob);
    }, 500);
  });
}

export async function deleteJobPosition(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const jobs = getFromStorage<JobPosition[]>(JOBS_STORAGE_KEY, []);
      const filtered = jobs.filter((j) => j.id !== id);

      if (filtered.length === jobs.length) {
        resolve(false); // Job not found
        return;
      }

      saveToStorage(JOBS_STORAGE_KEY, filtered);
      resolve(true);
    }, 400);
  });
}

// Career Applications API (keeping existing functionality)
export async function getCareerApplications(): Promise<CareerApplication[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const applications = getFromStorage<CareerApplication[]>(
        APPLICATIONS_STORAGE_KEY,
        []
      );
      resolve(applications);
    }, 500);
  });
}

export async function getCareerApplicationById(
  id: string
): Promise<CareerApplication | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const applications = getFromStorage<CareerApplication[]>(
        APPLICATIONS_STORAGE_KEY,
        []
      );
      const application = applications.find((app) => app.id === id);
      resolve(application || null);
    }, 300);
  });
}

export async function createCareerApplication(
  applicationData: Omit<CareerApplication, "id" | "submittedAt" | "status">
): Promise<CareerApplication> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const applications = getFromStorage<CareerApplication[]>(
        APPLICATIONS_STORAGE_KEY,
        []
      );

      const newApplication: CareerApplication = {
        id: `app-${uuidv4().substring(0, 8)}`,
        ...applicationData,
        submittedAt: new Date().toISOString(),
        status: "pending",
      };

      applications.push(newApplication);
      saveToStorage(APPLICATIONS_STORAGE_KEY, applications);
      resolve(newApplication);
    }, 700);
  });
}

export async function updateCareerApplicationStatus(
  id: string,
  status: ApplicationStatus,
  notes?: string,
  reviewerEmail?: string,
  interviewDate?: string
): Promise<CareerApplication | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const applications = getFromStorage<CareerApplication[]>(
        APPLICATIONS_STORAGE_KEY,
        []
      );
      const index = applications.findIndex((app) => app.id === id);

      if (index === -1) {
        resolve(null);
        return;
      }

      const updatedApplication = {
        ...applications[index],
        status,
        notes: notes || applications[index].notes,
        reviewedBy: reviewerEmail || applications[index].reviewedBy,
        reviewedAt: new Date().toISOString(),
        interviewDate: interviewDate || applications[index].interviewDate,
      };

      applications[index] = updatedApplication;
      saveToStorage(APPLICATIONS_STORAGE_KEY, applications);
      resolve(updatedApplication);
    }, 500);
  });
}
