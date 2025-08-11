import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';
import { UserRole } from '@/lib/auth';

// GET /api/admin/users/[id] - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
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

    // Transform the data
    const transformedUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      role: user.role.toLowerCase() as UserRole,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      profileComplete: user.profileComplete,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    };

    return NextResponse.json({ user: transformedUser });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, email, username, phone, address, role } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !username || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email/username is taken by another user
    const duplicateUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } }, // Exclude current user
          {
            OR: [
              { email: email },
              { username: username }
            ]
          }
        ]
      }
    });

    if (duplicateUser) {
      return NextResponse.json(
        { error: duplicateUser.email === email ? 'Email already exists' : 'Username already exists' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        username,
        phone: phone || null,
        address: address || null,
        role: role.toUpperCase() as any, // Convert to uppercase for Prisma enum
        updatedAt: new Date(),
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
        isActive: true,
        profileComplete: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      }
    });

    // Transform the response
    const transformedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role.toLowerCase() as UserRole,
      isEmailVerified: updatedUser.isEmailVerified,
      isActive: updatedUser.isActive,
      profileComplete: updatedUser.profileComplete,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
      lastLogin: updatedUser.lastLogin?.toISOString(),
    };

    return NextResponse.json({ user: transformedUser });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't allow deletion of admin users (safety check)
    if (existingUser.role === 'ADMIN' || existingUser.role === 'SUPER_ADMIN') {
      // Count admin users
      const adminCount = await prisma.user.count({
        where: {
          role: { in: ['ADMIN', 'SUPER_ADMIN'] }
        }
      });

      // Don't allow deletion if this is the last admin
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        );
      }
    }

    // Soft delete by deactivating instead of hard delete
    // This preserves data integrity for related records
    const deactivatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({ 
      message: 'User deactivated successfully',
      userId: id 
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}