export interface MedicalReview {
  id: string;
  patientId: string;
  reviewerId: string; // ID of reviewer who created this
  reviewerName: string;
  type: ReviewType;
  title: string;
  findings: string;
  assessment: string;
  recommendations: string;
  treatmentPlan?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  priority: "low" | "medium" | "high";
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  reviewedDate: string; // Date of actual medical review/examination
  vitalsReviewed?: string[]; // IDs of vital records reviewed
  medicationsReviewed?: string[]; // IDs of medications reviewed
  symptomsAddressed?: string[]; // IDs of symptom reports addressed
  attachments?: ReviewAttachment[];
  notes?: string;
  isConfidential: boolean;
  sharedWith?: string[]; // User IDs who can access this review
}

export type ReviewType =
  | "routine"
  | "urgent"
  | "follow_up"
  | "consultation";

export type ReviewStatus =
  | "pending"
  | "in_review"
  | "completed"
  | "cancelled";

export interface ReviewAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
}

export interface ReviewTemplate {
  id: string;
  type: ReviewType;
  name: string;
  sections: ReviewSection[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ReviewSection {
  id: string;
  title: string;
  fields: ReviewField[];
  isRequired: boolean;
  order: number;
}

export interface ReviewField {
  id: string;
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "date" | "number";
  options?: string[]; // For select fields
  isRequired: boolean;
  placeholder?: string;
  defaultValue?: string;
}

// For tracking review history and updates
export interface ReviewHistory {
  id: string;
  reviewId: string;
  action: "created" | "updated" | "status_changed" | "shared" | "archived";
  changes: Record<string, any>;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

// Summary statistics for reviews
export interface ReviewSummary {
  totalReviews: number;
  reviewsByType: Record<ReviewType, number>;
  reviewsByStatus: Record<ReviewStatus, number>;
  avgReviewsPerMonth: number;
  pendingFollowUps: number;
  urgentReviews: number;
}
