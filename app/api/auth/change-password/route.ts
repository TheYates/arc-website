import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';
import { validatePassword, hashPassword, verifyPassword, isDefaultPassword } from '@/lib/utils/password';

// POST /api/auth/change-password - Change user password
export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    // Validate required fields
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, currentPassword, newPassword' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Validate new password complexity
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors 
        },
        { status: 400 }
      );
    }

    // Check if new password is the same as current
    const isSamePassword = await verifyPassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Check if new password is still the default "password"
    if (isDefaultPassword(newPassword)) {
      return NextResponse.json(
        { error: 'Password cannot be the default "password". Please choose a secure password.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update the password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedNewPassword,
        mustChangePassword: false, // User no longer needs to change password
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Log the password change
    console.log(`Password changed successfully for user ${user.email} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}

// GET /api/auth/change-password - Get password requirements
export async function GET() {
  try {
    const { PASSWORD_REQUIREMENTS } = await import('@/lib/utils/password');
    
    return NextResponse.json({
      requirements: {
        minLength: PASSWORD_REQUIREMENTS.minLength,
        requireNumbers: PASSWORD_REQUIREMENTS.requireNumbers,
        requireSpecialChars: PASSWORD_REQUIREMENTS.requireSpecialChars,
        requireUppercase: PASSWORD_REQUIREMENTS.requireUppercase,
        requireLowercase: PASSWORD_REQUIREMENTS.requireLowercase,
      },
      description: [
        `At least ${PASSWORD_REQUIREMENTS.minLength} characters long`,
        'Must contain at least one number',
        'Must contain at least one special character',
        'Must contain at least one uppercase letter',
        'Must contain at least one lowercase letter',
      ]
    });
  } catch (error) {
    console.error('Get password requirements error:', error);
    return NextResponse.json(
      { error: 'Failed to get password requirements' },
      { status: 500 }
    );
  }
}