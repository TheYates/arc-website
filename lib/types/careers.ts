export type JobCategory = string; // Dynamic categories managed by admin

export type JobStatus = "draft" | "published" | "archived";

export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "interview"
  | "hired"
  | "rejected";

export interface JobPosition {
  id: string;
  title: string;
  type: string; // Full-time, Part-time, Contract
  location: string;
  description: string;
  requirements: string[];
  salary: string;
  category: string;
  status: JobStatus;
  // Optional new fields
  publicationDate?: string;
  expirationDate?: string;
  applicationDeadline?: string;
  numberOfPositions?: number;
  remoteWorkOptions?: string;
  benefits?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string; // Admin who created the job
}

export interface CareerApplication {
  id: string;
  positionId?: string; // Optional if it's a general application
  positionTitle?: string; // Title of the position they applied for
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  resumeUrl?: string; // URL to the uploaded resume
  coverLetter?: string;
  experience?: string;
  education?: string;
  references?: string[];
  skills?: string[];
  submittedAt: string;
  status: ApplicationStatus;
  notes?: string;
  interviewDate?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
