import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';

// GET /api/admin/staff - Get available staff (caregivers and reviewers)
export async function GET() {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ['CAREGIVER', 'REVIEWER', 'ADMIN'], // Match the exact enum values from Prisma
        },
        isActive: true,
      },
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
        createdAt: true,
        lastLogin: true,
        profileComplete: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    // Separate caregivers and reviewers (fixed to avoid showing all users)
    const caregivers = staff.filter((user: any) =>
      user.role === 'CAREGIVER'
    );
    
    const reviewers = staff.filter((user: any) => 
      user.role === 'REVIEWER'
    );

    // Transform response
    const transformedCaregivers = caregivers.map((user: any) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString() || null,
      profileComplete: user.profileComplete,
    }));

    const transformedReviewers = reviewers.map((user: any) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString() || null,
      profileComplete: user.profileComplete,
    }));

    return NextResponse.json({
      caregivers: transformedCaregivers,
      reviewers: transformedReviewers,
      total: staff.length,
    });

  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return NextResponse.json(
      { error: `Failed to fetch staff: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}