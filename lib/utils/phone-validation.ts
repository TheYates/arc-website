/**
 * Phone number validation and formatting utilities
 * Supports formats: "+233 XX XXX XXXX" and "024 XXX XXXX"
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

/**
 * Validates and formats a phone number
 * Accepts formats:
 * - "+233 XX XXX XXXX" (international format)
 * - "024 XXX XXXX" (local format)
 * - Raw numbers that can be formatted
 */
export function validateAndFormatPhone(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }

  // Remove all spaces and special characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check for international format (+233XXXXXXXXX)
  if (cleaned.startsWith('+233')) {
    const digits = cleaned.substring(4); // Remove +233
    
    if (digits.length === 9) {
      // Format as "+233 XX XXX XXXX"
      const formatted = `+233 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
      return {
        isValid: true,
        formatted
      };
    } else {
      return {
        isValid: false,
        error: 'International format should be +233 followed by 9 digits'
      };
    }
  }
  
  // Check for local format (0XXXXXXXXX)
  if (cleaned.startsWith('0')) {
    const digits = cleaned.substring(1); // Remove leading 0
    
    if (digits.length === 9) {
      // Format as "0XX XXX XXXX"
      const formatted = `0${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
      return {
        isValid: true,
        formatted
      };
    } else {
      return {
        isValid: false,
        error: 'Local format should start with 0 followed by 9 digits'
      };
    }
  }
  
  // Try to auto-detect format for raw 9-digit numbers
  if (cleaned.length === 9 && /^\d{9}$/.test(cleaned)) {
    // Default to local format
    const formatted = `0${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
    return {
      isValid: true,
      formatted
    };
  }
  
  return {
    isValid: false,
    error: 'Phone number must be in format "+233 XX XXX XXXX" or "024 XXX XXXX"'
  };
}

/**
 * Formats a phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const result = validateAndFormatPhone(phone);
  return result.formatted || phone;
}

/**
 * Converts phone number to international format for calling
 */
export function formatPhoneForCalling(phone: string): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Already international
  if (cleaned.startsWith('+233')) {
    return cleaned;
  }
  
  // Local format - convert to international
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+233${cleaned.substring(1)}`;
  }
  
  // Raw 9 digits - assume local and convert
  if (cleaned.length === 9 && /^\d{9}$/.test(cleaned)) {
    return `+233${cleaned}`;
  }
  
  return phone; // Return as-is if can't format
}

/**
 * Validates multiple phone numbers
 */
export function validatePhoneNumbers(primaryPhone: string, secondaryPhone?: string): {
  isValid: boolean;
  errors: string[];
  formattedPrimary?: string;
  formattedSecondary?: string;
} {
  const errors: string[] = [];
  
  // Validate primary phone
  const primaryResult = validateAndFormatPhone(primaryPhone);
  if (!primaryResult.isValid) {
    errors.push(`Primary phone: ${primaryResult.error}`);
  }
  
  // Validate secondary phone if provided
  let secondaryResult: PhoneValidationResult | null = null;
  if (secondaryPhone && secondaryPhone.trim()) {
    secondaryResult = validateAndFormatPhone(secondaryPhone);
    if (!secondaryResult.isValid) {
      errors.push(`Secondary phone: ${secondaryResult.error}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    formattedPrimary: primaryResult.formatted,
    formattedSecondary: secondaryResult?.formatted
  };
}
