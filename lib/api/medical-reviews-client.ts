// Client-side API functions for medical reviews using Neon DB
import { createAuthHeaders } from "./auth-headers";

// Simple in-memory cache for medical reviews
const reviewsCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();

function getCachedReviews(key: string): any | null {
  const cached = reviewsCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log(`💾 Reviews Cache HIT for ${key}`);
    return cached.data;
  }
  if (cached) {
    reviewsCache.delete(key); // Remove expired cache
  }
  return null;
}

function setCachedReviews(key: string, data: any, ttlMs: number = 60000): void {
  reviewsCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
  console.log(`💾 Reviews Cache SET for ${key} (TTL: ${ttlMs}ms)`);
}

export interface MedicalReviewData {
  id: string;
  patientId: string;
  reviewerId?: string;
  createdById: string;
  reviewType: "ROUTINE" | "URGENT" | "FOLLOW_UP" | "CONSULTATION";
  status: "PENDING" | "IN_REVIEW" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  description: string;
  findings?: string;
  recommendations?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateMedicalReviewRequest {
  patientId: string;
  reviewerId?: string;
  createdById: string;
  reviewType: "ROUTINE" | "URGENT" | "FOLLOW_UP" | "CONSULTATION";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  description: string;
  findings?: string;
  recommendations?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface UpdateMedicalReviewRequest {
  reviewerId?: string;
  reviewType?: "ROUTINE" | "URGENT" | "FOLLOW_UP" | "CONSULTATION";
  status?: "PENDING" | "IN_REVIEW" | "COMPLETED" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  title?: string;
  description?: string;
  findings?: string;
  recommendations?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

// Get medical reviews with optional filtering
export async function getMedicalReviewsClient(
  patientId?: string,
  reviewerId?: string,
  status?: string
): Promise<MedicalReviewData[]> {
  const cacheKey = `reviews-${patientId || "all"}-${reviewerId || "all"}-${
    status || "all"
  }`;
  const cached = getCachedReviews(cacheKey);
  if (cached) {
    return cached;
  }

  const start = performance.now();
  const params = new URLSearchParams();
  if (patientId) params.append("patientId", patientId);
  if (reviewerId) params.append("reviewerId", reviewerId);
  if (status) params.append("status", status);

  const response = await fetch(`/api/medical-reviews?${params.toString()}`, {
    headers: createAuthHeaders(null),
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  const fetchEnd = performance.now();

  if (!response.ok) {
    throw new Error("Failed to fetch medical reviews");
  }

  const data = await response.json();
  const parseEnd = performance.now();

  console.log(
    `📋 Medical Reviews Client API: fetch ${(fetchEnd - start).toFixed(
      2
    )}ms, parse ${(parseEnd - fetchEnd).toFixed(2)}ms, total ${(
      parseEnd - start
    ).toFixed(2)}ms`
  );

  // Cache the result for 60 seconds
  setCachedReviews(cacheKey, data.reviews, 60000);

  return data.reviews;
}

// Get medical review by ID
export async function getMedicalReviewByIdClient(
  id: string
): Promise<MedicalReviewData> {
  const response = await fetch(`/api/medical-reviews/${id}`, {
    headers: createAuthHeaders(null),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch medical review");
  }

  const data = await response.json();
  return data.review;
}

// Create new medical review
export async function createMedicalReviewClient(
  reviewData: CreateMedicalReviewRequest
): Promise<MedicalReviewData> {
  const response = await fetch("/api/medical-reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...createAuthHeaders(null),
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create medical review");
  }

  const data = await response.json();
  return data.review;
}

// Update medical review
export async function updateMedicalReviewClient(
  id: string,
  reviewData: UpdateMedicalReviewRequest
): Promise<MedicalReviewData> {
  const response = await fetch(`/api/medical-reviews/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...createAuthHeaders(null),
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update medical review");
  }

  const data = await response.json();
  return data.review;
}

// Delete medical review
export async function deleteMedicalReviewClient(id: string): Promise<void> {
  const response = await fetch(`/api/medical-reviews/${id}`, {
    method: "DELETE",
    headers: createAuthHeaders(null),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete medical review");
  }
}

// Get review statistics
export async function getReviewStatisticsClient(reviewerId?: string) {
  const params = new URLSearchParams();
  params.append("stats", "true");
  if (reviewerId) params.append("reviewerId", reviewerId);

  const response = await fetch(`/api/medical-reviews?${params.toString()}`, {
    headers: createAuthHeaders(null),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch review statistics");
  }

  const data = await response.json();
  return data.stats;
}

// Helper functions for backward compatibility with existing code
export async function getMedicalReviews(
  patientId?: string,
  reviewerId?: string
): Promise<MedicalReviewData[]> {
  const start = performance.now();
  const result = await getMedicalReviewsClient(patientId, reviewerId);
  const end = performance.now();

  console.log(
    `📋 Medical Reviews API: total ${(end - start).toFixed(2)}ms, found ${
      result.length
    } reviews`
  );
  return result;
}

export async function getMedicalReviewById(
  id: string
): Promise<MedicalReviewData | null> {
  try {
    return await getMedicalReviewByIdClient(id);
  } catch (error) {
    console.error("Error fetching medical review:", error);
    return null;
  }
}

export async function createMedicalReview(
  reviewData: CreateMedicalReviewRequest
): Promise<MedicalReviewData> {
  return createMedicalReviewClient(reviewData);
}

export async function updateMedicalReview(
  id: string,
  reviewData: UpdateMedicalReviewRequest
): Promise<MedicalReviewData | null> {
  try {
    return await updateMedicalReviewClient(id, reviewData);
  } catch (error) {
    console.error("Error updating medical review:", error);
    return null;
  }
}

export async function deleteMedicalReview(id: string): Promise<boolean> {
  try {
    await deleteMedicalReviewClient(id);
    return true;
  } catch (error) {
    console.error("Error deleting medical review:", error);
    return false;
  }
}

export async function getReviewsByStatus(
  status: string,
  patientId?: string
): Promise<MedicalReviewData[]> {
  return getMedicalReviewsClient(patientId, undefined, status);
}
