/**
 * Date utility functions using Luxon
 *
 * This module provides a standardized API for date and time operations
 * to ensure consistency across the application.
 */
import { DateTime } from 'luxon';

/**
 * Format types supported by the application
 */
export const DateFormats = {
  /**
   * Full date format (e.g., "April 20, 2023")
   * Equivalent to date-fns 'PPP'
   */
  FULL_DATE: 'LLLL d, yyyy',

  /**
   * Short date format (e.g., "04/20/2023")
   */
  SHORT_DATE: 'MM/dd/yyyy',

  /**
   * Date with time (e.g., "April 20, 2023 at 2:30 PM")
   */
  DATE_TIME: "LLLL d, yyyy 'at' h:mm a",

  /**
   * Time only (e.g., "2:30 PM")
   */
  TIME: 'h:mm a',
} as const;

export type DateFormatType = keyof typeof DateFormats;

/**
 * Format a date using one of the predefined formats
 *
 * @param date - Date to format (Date object, ISO string, timestamp, or Luxon DateTime)
 * @param formatType - Format type from DateFormats
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number | DateTime,
  formatType: DateFormatType = 'FULL_DATE'
): string {
  const dateTime = parseToDateTime(date);
  return dateTime.toFormat(DateFormats[formatType]);
}

/**
 * Format a date using a custom format string
 *
 * @param date - Date to format (Date object, ISO string, timestamp, or Luxon DateTime)
 * @param formatString - Custom Luxon format string
 * @returns Formatted date string
 */
export function formatDateCustom(
  date: Date | string | number | DateTime,
  formatString: string
): string {
  const dateTime = parseToDateTime(date);
  return dateTime.toFormat(formatString);
}

/**
 * Convert various date inputs to a Luxon DateTime object
 *
 * @param date - Date input (Date object, ISO string, timestamp, or Luxon DateTime)
 * @returns Luxon DateTime object
 */
export function parseToDateTime(date: Date | string | number | DateTime): DateTime {
  if (date instanceof DateTime) {
    return date;
  }

  if (date instanceof Date) {
    return DateTime.fromJSDate(date);
  }

  if (typeof date === 'string') {
    // Try ISO format first
    const dateTime = DateTime.fromISO(date);
    if (dateTime.isValid) {
      return dateTime;
    }
    // Fall back to parsing as timestamp
    return DateTime.fromMillis(Number.parseInt(date, 10));
  }

  // Handle timestamp (number)
  return DateTime.fromMillis(date);
}

/**
 * Get current date and time
 *
 * @returns Current date/time as Luxon DateTime
 */
export function now(): DateTime {
  return DateTime.now();
}

/**
 * Create a new date
 *
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day
 * @returns DateTime object
 */
export function createDate(year: number, month: number, day: number): DateTime {
  return DateTime.local(year, month, day);
}

/**
 * Add a duration to a date
 *
 * @param date - Base date
 * @param duration - Duration to add (e.g., { days: 1, months: 1 })
 * @returns New date with duration added
 */
export function addToDate(
  date: Date | string | number | DateTime,
  duration: { days?: number; months?: number; years?: number; hours?: number; minutes?: number }
): DateTime {
  const dateTime = parseToDateTime(date);
  return dateTime.plus(duration);
}

/**
 * Compare two dates
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Negative if date1 < date2, positive if date1 > date2, 0 if equal
 */
export function compareDate(
  date1: Date | string | number | DateTime,
  date2: Date | string | number | DateTime
): number {
  const dt1 = parseToDateTime(date1);
  const dt2 = parseToDateTime(date2);
  return dt1.valueOf() - dt2.valueOf();
}

/**
 * Check if a date is valid
 *
 * @param date - Date to check
 * @returns True if valid, false otherwise
 */
export function isValidDate(date: any): boolean {
  if (date instanceof DateTime) {
    return date.isValid;
  }
  return parseToDateTime(date).isValid;
}
