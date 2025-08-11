import { prisma } from '@/lib/database/postgresql';
import { MedicalReview, MedicalReviewType, MedicalReviewStatus, Priority } from '@prisma/client';

// Types for API responses
export interface MedicalReviewWithRelations extends MedicalReview {
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
  } | null;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateMedicalReviewData {
  patientId: string;
  reviewerId?: string;
  createdById: string;
  reviewType: MedicalReviewType;
  priority?: Priority;
  title: string;
  description: string;
  findings?: string;
  recommendations?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
}

export interface UpdateMedicalReviewData {
  reviewerId?: string;
  reviewType?: MedicalReviewType;
  status?: MedicalReviewStatus;
  priority?: Priority;
  title?: string;
  description?: string;
  findings?: string;
  recommendations?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
}

// Get all medical reviews with optional filtering
export async function getMedicalReviews(
  patientId?: string,
  reviewerId?: string,
  status?: MedicalReviewStatus
): Promise<MedicalReviewWithRelations[]> {
  const where: any = {};
  
  if (patientId) where.patientId = patientId;
  if (reviewerId) where.reviewerId = reviewerId;
  if (status) where.status = status;

  const reviews = await prisma.medicalReview.findMany({
    where,
    include: {
      patient: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      },
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Transform the response to match expected format
  return reviews.map(review => ({
    ...review,
    patient: {
      id: review.patient.id,
      firstName: review.patient.user.firstName,
      lastName: review.patient.user.lastName,
      email: review.patient.user.email,
    }
  }));
}

// Get medical review by ID
export async function getMedicalReviewById(id: string): Promise<MedicalReviewWithRelations | null> {
  const review = await prisma.medicalReview.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      },
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    }
  });

  if (!review) return null;

  return {
    ...review,
    patient: {
      id: review.patient.id,
      firstName: review.patient.user.firstName,
      lastName: review.patient.user.lastName,
      email: review.patient.user.email,
    }
  };
}

// Create new medical review
export async function createMedicalReview(data: CreateMedicalReviewData): Promise<MedicalReview> {
  return await prisma.medicalReview.create({
    data: {
      patientId: data.patientId,
      reviewerId: data.reviewerId,
      createdById: data.createdById,
      reviewType: data.reviewType,
      priority: data.priority || 'MEDIUM',
      title: data.title,
      description: data.description,
      findings: data.findings,
      recommendations: data.recommendations,
      followUpRequired: data.followUpRequired || false,
      followUpDate: data.followUpDate,
      status: 'PENDING',
    }
  });
}

// Update medical review
export async function updateMedicalReview(
  id: string, 
  data: UpdateMedicalReviewData
): Promise<MedicalReview | null> {
  try {
    return await prisma.medicalReview.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Error updating medical review:', error);
    return null;
  }
}

// Delete medical review
export async function deleteMedicalReview(id: string): Promise<boolean> {
  try {
    await prisma.medicalReview.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    console.error('Error deleting medical review:', error);
    return false;
  }
}

// Get medical reviews by status
export async function getMedicalReviewsByStatus(
  status: MedicalReviewStatus,
  patientId?: string
): Promise<MedicalReviewWithRelations[]> {
  return getMedicalReviews(patientId, undefined, status);
}

// Get medical reviews by reviewer
export async function getMedicalReviewsByReviewer(
  reviewerId: string
): Promise<MedicalReviewWithRelations[]> {
  return getMedicalReviews(undefined, reviewerId);
}

// Get medical reviews by patient
export async function getMedicalReviewsByPatient(
  patientId: string
): Promise<MedicalReviewWithRelations[]> {
  return getMedicalReviews(patientId);
}

// Get review statistics
export async function getReviewStatistics(reviewerId?: string) {
  const where: any = {};
  if (reviewerId) where.reviewerId = reviewerId;

  const [
    totalReviews,
    pendingReviews,
    inReviewReviews,
    completedReviews,
    urgentReviews,
    followUpRequired
  ] = await Promise.all([
    prisma.medicalReview.count({ where }),
    prisma.medicalReview.count({ where: { ...where, status: 'PENDING' } }),
    prisma.medicalReview.count({ where: { ...where, status: 'IN_REVIEW' } }),
    prisma.medicalReview.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.medicalReview.count({ where: { ...where, priority: 'HIGH' } }),
    prisma.medicalReview.count({ where: { ...where, followUpRequired: true, status: { not: 'COMPLETED' } } })
  ]);

  return {
    totalReviews,
    reviewsByStatus: {
      pending: pendingReviews,
      in_review: inReviewReviews,
      completed: completedReviews,
    },
    urgentReviews,
    pendingFollowUps: followUpRequired,
  };
}
