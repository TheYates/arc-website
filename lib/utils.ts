import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in GHS currency
 * @param amount - The price amount
 * @returns Formatted price string (e.g., "GHS 50.00")
 */
export function formatPrice(amount: number): string {
  return `GHS ${amount.toFixed(2)}`;
}

/**
 * Format optional item price for display
 * @param amount - The price amount
 * @returns Formatted price string with plus sign (e.g., "+GHS 50.00")
 */
export function formatOptionalPrice(amount: number): string {
  if (amount <= 0) return "";
  return `+${formatPrice(amount)}`;
}

/**
 * Formats a date to the standard app format: "28th July, 2025"
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("en-US", { month: "long" });
  const year = dateObj.getFullYear();

  // Add ordinal suffix to day
  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
}

/**
 * Formats a date with time to the standard app format: "28th July, 2025 at 2:30 PM"
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  // Format the date part
  const datePart = formatDate(dateObj);

  // Format the time part
  const timePart = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${datePart} at ${timePart}`;
}

/**
 * Formats a date range to the standard app format
 * @param startDate - The start date
 * @param endDate - The end date (optional)
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: Date, endDate?: Date): string {
  if (!endDate) {
    return `${formatDate(startDate)} - (select end date)`;
  }
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

// Example usage and test cases:
// formatDate(new Date(2025, 6, 28)) => "28th July, 2025"
// formatDate(new Date(2025, 6, 1)) => "1st July, 2025"
// formatDate(new Date(2025, 6, 2)) => "2nd July, 2025"
// formatDate(new Date(2025, 6, 3)) => "3rd July, 2025"
// formatDate(new Date(2025, 6, 21)) => "21st July, 2025"

/**
 * Format blood type from database format to display format
 * @param bloodType - The blood type from database (e.g., "A_POSITIVE")
 * @returns Formatted blood type (e.g., "A+")
 */
export function formatBloodType(bloodType: string | null | undefined): string {
  if (!bloodType) return "Not specified";

  const bloodTypeMap: Record<string, string> = {
    'A_POSITIVE': 'A+',
    'A_NEGATIVE': 'A-',
    'B_POSITIVE': 'B+',
    'B_NEGATIVE': 'B-',
    'AB_POSITIVE': 'AB+',
    'AB_NEGATIVE': 'AB-',
    'O_POSITIVE': 'O+',
    'O_NEGATIVE': 'O-',
  };

  return bloodTypeMap[bloodType.toUpperCase()] || bloodType;
}

/**
 * Format gender from database format to display format
 * @param gender - The gender from database (e.g., "female")
 * @returns Formatted gender (e.g., "Female")
 */
export function formatGender(gender: string | null | undefined): string {
  if (!gender) return "Not specified";

  const genderMap: Record<string, string> = {
    'MALE': 'Male',
    'FEMALE': 'Female',
    'OTHER': 'Other',
    'male': 'Male',
    'female': 'Female',
    'other': 'Other',
  };

  return genderMap[gender] || gender;
}

/**
 * Format care level from database format to display format
 * @param careLevel - The care level from database (e.g., "medium")
 * @returns Formatted care level (e.g., "Medium")
 */
export function formatCareLevel(careLevel: string | null | undefined): string {
  if (!careLevel) return "Not specified";

  const careLevelMap: Record<string, string> = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'CRITICAL': 'Critical',
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'critical': 'Critical',
  };

  return careLevelMap[careLevel] || careLevel;
}

/**
 * Format patient status from database format to display format
 * @param status - The patient status from database (e.g., "stable")
 * @returns Formatted status (e.g., "Stable")
 */
export function formatPatientStatus(status: string | null | undefined): string {
  if (!status) return "Not specified";

  const statusMap: Record<string, string> = {
    'STABLE': 'Stable',
    'IMPROVING': 'Improving',
    'DECLINING': 'Declining',
    'CRITICAL': 'Critical',
    'stable': 'Stable',
    'improving': 'Improving',
    'declining': 'Declining',
    'critical': 'Critical',
  };

  return statusMap[status] || status;
}
