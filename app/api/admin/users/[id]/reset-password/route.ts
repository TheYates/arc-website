import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';
import { generateSecurePassword, hashPassword } from '@/lib/utils/password';

// POST /api/admin/users/[id]/reset-password - Admin reset user password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    
    // Verify the requesting user is an admin
    // TODO: Add proper admin authentication middleware
    const body = await request.json();
    const { adminId } = body;
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Verify admin permissions
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Set default password to "password"
    const newPassword = "password";
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and force password change
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        mustChangePassword: true,
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Log the password reset (audit trail)
    console.log(`Password reset by admin ${admin.email} for user ${targetUser.email} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${targetUser.firstName} ${targetUser.lastName}`,
      newPassword: newPassword,
      userInfo: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        role: targetUser.role,
      },
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[id]/reset-password - Get user info for password reset confirmation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        passwordChangedAt: true,
        mustChangePassword: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    );
  }
}