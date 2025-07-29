import { v4 as uuidv4 } from "uuid";
import {
  MedicalReview,
  ReviewType,
  ReviewStatus,
  ReviewSummary,
  ReviewHistory,
} from "../types/medical-reviews";

const REVIEWS_STORAGE_KEY = "medical_reviews";
const REVIEW_HISTORY_STORAGE_KEY = "medical_review_history";

// Default/mock reviews for demonstration
const defaultReviews: MedicalReview[] = [
  {
    id: "review-001",
    patientId: "101",
    reviewerId: "reviewer-001",
    reviewerName: "Dr. Kwame Mensah",
    type: "routine_checkup",
    title: "Monthly Health Assessment",
    findings:
      "Patient shows good vital signs overall. Blood pressure slightly elevated but within acceptable range. Weight stable since last visit.",
    assessment:
      "Patient is responding well to current treatment plan. Minor adjustment to medication timing recommended.",
    recommendations:
      "Continue current medications with adjusted timing. Increase water intake. Schedule follow-up in 2 weeks.",
    treatmentPlan:
      "Maintain current care plan with minor modifications to medication schedule.",
    followUpRequired: true,
    followUpDate: "2024-12-15",
    priority: "medium",
    status: "completed",
    createdAt: "2024-11-15T10:30:00Z",
    updatedAt: "2024-11-15T10:30:00Z",
    reviewedDate: "2024-11-15",
    vitalsReviewed: ["vital-001", "vital-002"],
    medicationsReviewed: ["med-001"],
    isConfidential: false,
    notes: "Patient cooperative and responsive during examination.",
  },
];

// Utility functions
const getFromStorage = (): MedicalReview[] => {
  if (typeof window === "undefined") return defaultReviews;

  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(defaultReviews));
      return defaultReviews;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading reviews from storage:", error);
    return defaultReviews;
  }
};

const saveToStorage = (reviews: MedicalReview[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (error) {
    console.error("Error saving reviews to storage:", error);
  }
};

const getHistoryFromStorage = (): ReviewHistory[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(REVIEW_HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading review history from storage:", error);
    return [];
  }
};

const saveHistoryToStorage = (history: ReviewHistory[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(REVIEW_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error saving review history to storage:", error);
  }
};

const addToHistory = (
  reviewId: string,
  action: ReviewHistory["action"],
  changes: Record<string, any>,
  performedBy: string,
  notes?: string
): void => {
  const history = getHistoryFromStorage();
  const newEntry: ReviewHistory = {
    id: uuidv4(),
    reviewId,
    action,
    changes,
    performedBy,
    performedAt: new Date().toISOString(),
    notes,
  };

  history.push(newEntry);
  saveHistoryToStorage(history);
};

// Main API functions
export const createMedicalReview = (
  reviewData: Partial<MedicalReview>
): MedicalReview => {
  const reviews = getFromStorage();

  const newReview: MedicalReview = {
    id: uuidv4(),
    patientId: reviewData.patientId || "",
    reviewerId: reviewData.reviewerId || "",
    reviewerName: reviewData.reviewerName || "",
    type: reviewData.type || "routine_checkup",
    title: reviewData.title || "",
    findings: reviewData.findings || "",
    assessment: reviewData.assessment || "",
    recommendations: reviewData.recommendations || "",
    treatmentPlan: reviewData.treatmentPlan,
    followUpRequired: reviewData.followUpRequired || false,
    followUpDate: reviewData.followUpDate,
    priority: reviewData.priority || "medium",
    status: reviewData.status || "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewedDate:
      reviewData.reviewedDate || new Date().toISOString().split("T")[0],
    vitalsReviewed: reviewData.vitalsReviewed || [],
    medicationsReviewed: reviewData.medicationsReviewed || [],
    symptomsAddressed: reviewData.symptomsAddressed || [],
    attachments: reviewData.attachments || [],
    notes: reviewData.notes,
    isConfidential: reviewData.isConfidential || false,
    sharedWith: reviewData.sharedWith || [],
  };

  reviews.push(newReview);
  saveToStorage(reviews);

  // Add to history
  addToHistory(
    newReview.id,
    "created",
    newReview,
    newReview.reviewerId,
    "Medical review created"
  );

  return newReview;
};

export const getMedicalReviews = (
  patientId?: string,
  reviewerId?: string
): MedicalReview[] => {
  const reviews = getFromStorage();

  if (patientId && reviewerId) {
    return reviews.filter(
      (review) =>
        review.patientId === patientId && review.reviewerId === reviewerId
    );
  } else if (patientId) {
    return reviews.filter((review) => review.patientId === patientId);
  } else if (reviewerId) {
    return reviews.filter((review) => review.reviewerId === reviewerId);
  }

  return reviews;
};

export const getMedicalReviewById = (id: string): MedicalReview | null => {
  const reviews = getFromStorage();
  return reviews.find((review) => review.id === id) || null;
};

export const updateMedicalReview = (
  id: string,
  updates: Partial<MedicalReview>
): MedicalReview | null => {
  const reviews = getFromStorage();
  const index = reviews.findIndex((review) => review.id === id);

  if (index === -1) return null;

  const originalReview = { ...reviews[index] };
  const updatedReview = {
    ...reviews[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  reviews[index] = updatedReview;
  saveToStorage(reviews);

  // Add to history
  addToHistory(
    id,
    "updated",
    updates,
    updates.reviewerId || originalReview.reviewerId,
    "Medical review updated"
  );

  return updatedReview;
};

export const deleteMedicalReview = (id: string, deletedBy: string): boolean => {
  const reviews = getFromStorage();
  const index = reviews.findIndex((review) => review.id === id);

  if (index === -1) return false;

  const deletedReview = reviews[index];
  reviews.splice(index, 1);
  saveToStorage(reviews);

  // Add to history
  addToHistory(
    id,
    "archived",
    { deleted: true },
    deletedBy,
    "Medical review deleted"
  );

  return true;
};

export const getReviewsByStatus = (
  status: ReviewStatus,
  patientId?: string
): MedicalReview[] => {
  const reviews = getFromStorage();
  return reviews.filter((review) => {
    const statusMatch = review.status === status;
    const patientMatch = !patientId || review.patientId === patientId;
    return statusMatch && patientMatch;
  });
};

export const getReviewsByType = (
  type: ReviewType,
  patientId?: string
): MedicalReview[] => {
  const reviews = getFromStorage();
  return reviews.filter((review) => {
    const typeMatch = review.type === type;
    const patientMatch = !patientId || review.patientId === patientId;
    return typeMatch && patientMatch;
  });
};

export const getReviewSummary = (
  patientId?: string,
  reviewerId?: string
): ReviewSummary => {
  const reviews = getMedicalReviews(patientId, reviewerId);

  const reviewsByType = reviews.reduce((acc, review) => {
    acc[review.type] = (acc[review.type] || 0) + 1;
    return acc;
  }, {} as Record<ReviewType, number>);

  const reviewsByStatus = reviews.reduce((acc, review) => {
    acc[review.status] = (acc[review.status] || 0) + 1;
    return acc;
  }, {} as Record<ReviewStatus, number>);

  const pendingFollowUps = reviews.filter(
    (review) =>
      review.followUpRequired &&
      review.status !== "archived" &&
      (!review.followUpDate || new Date(review.followUpDate) <= new Date())
  ).length;

  const urgentReviews = reviews.filter(
    (review) =>
      review.priority === "urgent" &&
      review.status !== "completed" &&
      review.status !== "archived"
  ).length;

  // Calculate average reviews per month (rough estimate)
  const oldestReview = reviews.reduce((oldest, review) => {
    return new Date(review.createdAt) < new Date(oldest.createdAt)
      ? review
      : oldest;
  }, reviews[0]);

  const monthsSinceOldest = oldestReview
    ? Math.max(
        1,
        Math.ceil(
          (Date.now() - new Date(oldestReview.createdAt).getTime()) /
            (1000 * 60 * 60 * 24 * 30)
        )
      )
    : 1;

  return {
    totalReviews: reviews.length,
    reviewsByType,
    reviewsByStatus,
    avgReviewsPerMonth: Number((reviews.length / monthsSinceOldest).toFixed(1)),
    pendingFollowUps,
    urgentReviews,
  };
};

export const getReviewHistory = (reviewId: string): ReviewHistory[] => {
  const history = getHistoryFromStorage();
  return history.filter((entry) => entry.reviewId === reviewId);
};

export const searchReviews = (
  query: string,
  patientId?: string
): MedicalReview[] => {
  const reviews = getMedicalReviews(patientId);
  const lowerQuery = query.toLowerCase();

  return reviews.filter(
    (review) =>
      review.title.toLowerCase().includes(lowerQuery) ||
      review.findings.toLowerCase().includes(lowerQuery) ||
      review.assessment.toLowerCase().includes(lowerQuery) ||
      review.recommendations.toLowerCase().includes(lowerQuery) ||
      (review.notes && review.notes.toLowerCase().includes(lowerQuery))
  );
};
