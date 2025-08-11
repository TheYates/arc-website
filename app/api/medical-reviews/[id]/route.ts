import { NextRequest, NextResponse } from 'next/server';
import { 
  getMedicalReviewById, 
  updateMedicalReview,
  deleteMedicalReview 
} from '@/lib/api/medical-reviews-prisma';
import { MedicalReviewType, MedicalReviewStatus, Priority } from '@prisma/client';

// GET /api/medical-reviews/[id] - Get specific medical review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await getMedicalReviewById(id);

    if (!review) {
      return NextResponse.json(
        { error: 'Medical review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Get medical review error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical review' },
      { status: 500 }
    );
  }
}

// PUT /api/medical-reviews/[id] - Update medical review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      reviewerId,
      reviewType,
      status,
      priority,
      title,
      description,
      findings,
      recommendations,
      followUpRequired,
      followUpDate
    } = body;

    // Validate enum values if provided
    if (reviewType && !Object.values(MedicalReviewType).includes(reviewType)) {
      return NextResponse.json(
        { error: 'Invalid review type' },
        { status: 400 }
      );
    }

    if (status && !Object.values(MedicalReviewStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (priority && !Object.values(Priority).includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority' },
        { status: 400 }
      );
    }

    const review = await updateMedicalReview(id, {
      reviewerId,
      reviewType,
      status,
      priority,
      title,
      description,
      findings,
      recommendations,
      followUpRequired,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Medical review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Update medical review error:', error);
    return NextResponse.json(
      { error: 'Failed to update medical review' },
      { status: 500 }
    );
  }
}

// DELETE /api/medical-reviews/[id] - Delete medical review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteMedicalReview(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Medical review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete medical review error:', error);
    return NextResponse.json(
      { error: 'Failed to delete medical review' },
      { status: 500 }
    );
  }
}
