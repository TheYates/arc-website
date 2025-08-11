import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';

// GET /api/auth/user/[id] - Get user data by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        profileComplete: true,
        mustChangePassword: true,
        passwordChangedAt: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      }
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

    // Convert to client format
    const clientUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      role: user.role.toLowerCase(),
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      profileComplete: user.profileComplete,
      mustChangePassword: user.mustChangePassword,
      passwordChangedAt: user.passwordChangedAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    };

    return NextResponse.json({ 
      success: true, 
      user: clientUser 
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
