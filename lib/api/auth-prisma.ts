import { prisma } from '@/lib/database/postgresql'
import bcrypt from 'bcryptjs'
import { User, UserRole } from '@prisma/client'

export interface CreateUserData {
  email: string
  username: string
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

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

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

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    return { success: true, user }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

// Create new user
export async function createUser(userData: CreateUserData): Promise<AuthResult> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username },
        ],
      },
    })

    if (existingUser) {
      return { 
        success: false, 
        error: existingUser.email === userData.email ? 'Email already exists' : 'Username already exists' 
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
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
