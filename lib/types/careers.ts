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
  responsibilities?: string[]; // Job responsibilities
  category: string;
  status: JobStatus;
  employmentType?: string; // FULL_TIME, PART_TIME, CONTRACT, etc.
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
  jobId?: string; // Job position ID
  positionId?: string; // Optional if it's a general application
  jobTitle?: string; // Title of the position they applied for
  positionTitle?: string; // Title of the position they applied for
  applicantName?: string; // Full name of applicant
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  resumeUrl?: string; // URL to the uploaded resume
  coverLetter?: string;
  experience?: string;
  workExperience?: string;
  education?: string;
  references?: string[];
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  availableStartDate?: string;
  submittedAt: string;
  appliedDate?: string;
  status: ApplicationStatus;
  notes?: string;
  adminNotes?: string;
  interviewDate?: string;
  interviewType?: string;
  interviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
