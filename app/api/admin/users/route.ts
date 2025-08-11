import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';
import { UserRole } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/admin/users - Get all users (excluding patients)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'PATIENT'
        }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match our User type
    const transformedUsers = users.map((user: any) => ({
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
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, username, phone, address, role } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !username || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: existingUser.email === email ? 'Email already exists' : 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash the default password "password" - users will be forced to change it on first login
    const hashedPassword = await bcrypt.hash('password', 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        address: address || null,
        role: role.toUpperCase() as any, // Convert to uppercase for Prisma enum
        mustChangePassword: true, // Force password change on first login
        isEmailVerified: false, // New users need to verify email
        isActive: true,
        profileComplete: true,
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
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      address: newUser.address,
      role: newUser.role.toLowerCase() as UserRole,
      isEmailVerified: newUser.isEmailVerified,
      isActive: newUser.isActive,
      profileComplete: newUser.profileComplete,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
      lastLogin: newUser.lastLogin?.toISOString(),
    };

    return NextResponse.json({ user: transformedUser }, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}