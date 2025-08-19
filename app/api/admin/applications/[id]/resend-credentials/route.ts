import { NextRequest, NextResponse } from 'next/server';
import { ApplicationApprovalService } from '@/lib/services/application-approval';

// POST /api/admin/applications/[id]/resend-credentials - Resend credentials to approved applicant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { method = 'both' } = body; // 'email', 'sms', or 'both'

    // Validate method parameter
    if (!['email', 'sms', 'both'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid method. Must be email, sms, or both' },
        { status: 400 }
      );
    }

    const result = await ApplicationApprovalService.resendCredentials(id, method);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Credentials resent successfully via ${method}`,
      method
    });

  } catch (error) {
    console.error('Resend credentials error:', error);
    return NextResponse.json(
      { error: 'Failed to resend credentials' },
      { status: 500 }
    );
  }
}
