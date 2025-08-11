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
