import { NextRequest, NextResponse } from 'next/server';
import { 
  getMedicalReviews, 
  createMedicalReview,
  getReviewStatistics 
} from '@/lib/api/medical-reviews-prisma';
import { MedicalReviewType, MedicalReviewStatus, Priority } from '@prisma/client';

// GET /api/medical-reviews - Get medical reviews with optional filtering
export async function GET(request: NextRequest) {
  try {
    const start = performance.now();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const reviewerId = searchParams.get('reviewerId');
    const status = searchParams.get('status') as MedicalReviewStatus | null;
    const getStats = searchParams.get('stats') === 'true';

    console.log(`🔍 Medical Reviews API called with patientId: ${patientId}, reviewerId: ${reviewerId}, status: ${status}`);

    if (getStats) {
      const statsStart = performance.now();
      const stats = await getReviewStatistics(reviewerId || undefined);
      const statsEnd = performance.now();
      console.log(`📊 Review statistics query took ${(statsEnd - statsStart).toFixed(2)}ms`);
      return NextResponse.json({ stats });
    }

    const dbStart = performance.now();
    const reviews = await getMedicalReviews(
      patientId || undefined,
      reviewerId || undefined,
      status || undefined
    );
    const dbEnd = performance.now();

    const total = performance.now();
    console.log(`📋 Medical Reviews API: DB query ${(dbEnd - dbStart).toFixed(2)}ms, total ${(total - start).toFixed(2)}ms, found ${reviews.length} reviews`);

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Get medical reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical reviews' },
      { status: 500 }
    );
  }
}

// POST /api/medical-reviews - Create new medical review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      reviewerId,
      createdById,
      reviewType,
      priority,
      title,
      description,
      findings,
      recommendations,
      followUpRequired,
      followUpDate
    } = body;

    // Validate required fields
    if (!patientId || !createdById || !reviewType || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, createdById, reviewType, title, description' },
        { status: 400 }
      );
    }

    // Validate enum values
    if (!Object.values(MedicalReviewType).includes(reviewType)) {
      return NextResponse.json(
        { error: 'Invalid review type' },
        { status: 400 }
      );
    }

    if (priority && !Object.values(Priority).includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority' },
        { status: 400 }
      );
    }

    const review = await createMedicalReview({
      patientId,
      reviewerId,
      createdById,
      reviewType,
      priority,
      title,
      description,
      findings,
      recommendations,
      followUpRequired,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Create medical review error:', error);
    return NextResponse.json(
      { error: 'Failed to create medical review' },
      { status: 500 }
    );
  }
}
