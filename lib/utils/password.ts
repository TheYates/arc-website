import bcrypt from 'bcryptjs'

/**
 * Password complexity requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireNumbers: true,
  requireSpecialChars: true,
  requireUppercase: true,
  requireLowercase: true,
} as const

/**
 * Generate a secure temporary password
 * Format: FirstName + 4 random digits + special char
 * Example: "Sarah2847!"
 */
export function generateTempPassword(firstName: string): string {
  const cleanFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
  const randomDigits = Math.floor(1000 + Math.random() * 9000) // 4 digits
  const specialChars = '!@#$%&*'
  const randomSpecial = specialChars.charAt(Math.floor(Math.random() * specialChars.length))
  
  return `${cleanFirstName}${randomDigits}${randomSpecial}`
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12 // Higher security
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Validate password complexity
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`)
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Check if password is the default "password"
 */
export function isDefaultPassword(password: string): boolean {
  return password.toLowerCase() === 'password'
}

/**
 * Generate a secure random password for admin resets
 * Format: 3 words + 2 digits + special char
 * Example: "River-Cloud-Moon47!"
 */
export function generateSecurePassword(): string {
  const words = [
    'River', 'Cloud', 'Moon', 'Star', 'Ocean', 'Forest', 'Stone', 'Wind',
    'Light', 'Shadow', 'Fire', 'Ice', 'Earth', 'Sky', 'Dream', 'Hope'
  ]
  
  const word1 = words[Math.floor(Math.random() * words.length)]
  const word2 = words[Math.floor(Math.random() * words.length)]
  const word3 = words[Math.floor(Math.random() * words.length)]
  const numbers = Math.floor(10 + Math.random() * 90) // 2 digits
  const specialChar = '!@#$%&*'[Math.floor(Math.random() * 7)]
  
  return `${word1}-${word2}-${word3}${numbers}${specialChar}`
}