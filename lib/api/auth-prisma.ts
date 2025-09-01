import { prisma } from '@/lib/database/postgresql'
import { resetDatabaseConnection } from '@/lib/database/postgresql'
import bcrypt from 'bcryptjs'
import { User, UserRole } from '@prisma/client'

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  role: UserRole
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

// Simplified authenticate user with fallback for development
export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    console.log(`🔍 Authentication attempt for email: ${email}`)

    // Quick connection test first
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection test timeout')), 3000)
        )
      ]);
      console.log('✅ Database connection test passed');
    } catch (connectionError) {
      console.error('❌ Database connection test failed:', connectionError);

      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Using development fallback authentication');
        return handleDevelopmentAuth(email, password);
      }

      throw new Error('Database connection failed');
    }

    // Database query with shorter timeout
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { email },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
    ]) as any;

    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is deactivated' }
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Update last login with timeout
    try {
      await Promise.race([
        prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Update timeout')), 5000)
        )
      ]);
    } catch (updateError) {
      console.warn('⚠️ Failed to update last login:', updateError);
      // Don't fail authentication if we can't update last login
    }

    console.log(`✅ Authentication successful for: ${email}`)
    return { success: true, user }

  } catch (error) {
    console.error(`❌ Authentication failed:`, error)

    // Check if it's a connection error
    if (isConnectionError(error)) {
      return { success: false, error: 'Database connection issues. Please try again.' }
    }

    return { success: false, error: 'Authentication failed. Please try again.' }
  }
}

// Development fallback authentication when database is unavailable
function handleDevelopmentAuth(email: string, password: string): AuthResult {
  // Simple development users with correct Prisma UserRole enum values
  const devCredentials = [
    { email: 'admin@arc.com', password: 'admin123', role: 'SUPER_ADMIN' as UserRole },
    { email: 'caregiver@arc.com', password: 'caregiver123', role: 'CAREGIVER' as UserRole },
    { email: 'reviewer@arc.com', password: 'reviewer123', role: 'REVIEWER' as UserRole },
  ];

  const cred = devCredentials.find(c => c.email === email);
  if (!cred || cred.password !== password) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Create a properly typed user object matching Prisma User type
  const user: User = {
    id: `dev-${cred.role.toLowerCase()}-1`,
    email: cred.email,
    firstName: cred.role === 'SUPER_ADMIN' ? 'Admin' :
               cred.role === 'CAREGIVER' ? 'Care' : 'Medical',
    lastName: cred.role === 'SUPER_ADMIN' ? 'User' :
              cred.role === 'CAREGIVER' ? 'Giver' : 'Reviewer',
    role: cred.role,
    isActive: true,
    passwordHash: cred.password,
    mustChangePassword: false,
    passwordChangedAt: new Date(),
    phone: null,
    address: null,
    isEmailVerified: true,
    profileComplete: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
  };

  console.log(`✅ Development authentication successful for: ${email}`);
  return { success: true, user };
}

// Helper function to identify connection errors
function isConnectionError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || ''
  return (
    errorMessage.includes('can\'t reach database server') ||
    errorMessage.includes('connection refused') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('network') ||
    error?.code === 'P1001' // Prisma connection error code
  )
}

// Create new user
export async function createUser(userData: CreateUserData): Promise<AuthResult> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: userData.email,
      },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'Email already exists'
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address,
        role: userData.role,
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error('User creation error:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        patient: true,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
      },
    })
  } catch (error) {
    console.error('Get user by email error:', error)
    return null
  }
}

// Update user
export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  try {
    return await prisma.user.update({
      where: { id },
      data,
    })
  } catch (error) {
    console.error('Update user error:', error)
    return null
  }
}

// Get all users by role
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  try {
    return await prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Get users by role error:', error)
    return []
  }
}

// Verify email
export async function verifyEmail(userId: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    })
    return true
  } catch (error) {
    console.error('Email verification error:', error)
    return false
  }
}

// Change password
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      return { success: false, error: 'Current password is incorrect' }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedNewPassword },
    })

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Change password error:', error)
    return { success: false, error: 'Failed to change password' }
  }
}

// Deactivate user
export async function deactivateUser(userId: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    })
    return true
  } catch (error) {
    console.error('Deactivate user error:', error)
    return false
  }
}

// Activate user
export async function activateUser(userId: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    })
    return true
  } catch (error) {
    console.error('Activate user error:', error)
    return false
  }
}
