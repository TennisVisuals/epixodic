/**
 * Date Utilities
 * 
 * Handles date formatting according to TODS standards (YYYY-MM-DD).
 * Replaces millisecond timestamp usage with ISO date strings.
 */

/**
 * Format a Date object to TODS standard YYYY-MM-DD
 */
export function formatToTODS(date: Date | number | string): string {
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    // Handle millisecond timestamps
    dateObj = new Date(date);
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = new Date();
  }

  // Validate date
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatToTODS:', date);
    return getTodayTODS();
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Parse TODS date string to Date object
 */
export function parseFromTODS(dateString: string): Date | null {
  if (!dateString) {
    return null;
  }

  // Handle YYYY-MM-DD format
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    console.warn('Invalid TODS date format:', dateString);
    return null;
  }

  const [, year, month, day] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Get today's date in TODS format
 */
export function getTodayTODS(): string {
  return formatToTODS(new Date());
}

/**
 * Convert milliseconds timestamp to TODS format
 */
export function timestampToTODS(timestamp: number): string {
  return formatToTODS(new Date(timestamp));
}

/**
 * Convert TODS date string to milliseconds timestamp
 */
export function todsToTimestamp(dateString: string): number | null {
  const date = parseFromTODS(dateString);
  return date ? date.getTime() : null;
}

/**
 * Validate TODS date format
 */
export function isValidTODSDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return false;
  }

  const date = parseFromTODS(dateString);
  return date !== null && !isNaN(date.getTime());
}

/**
 * Format date for display (localized)
 */
export function formatForDisplay(
  date: Date | number | string,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else if (typeof date === 'string') {
    // Try to parse as TODS format first
    const parsed = parseFromTODS(date);
    dateObj = parsed || new Date(date);
  } else {
    dateObj = new Date();
  }

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return dateObj.toLocaleDateString(locale, defaultOptions);
}

/**
 * Compare two TODS dates
 */
export function compareTODSDates(date1: string, date2: string): number {
  const d1 = parseFromTODS(date1);
  const d2 = parseFromTODS(date2);

  if (!d1 || !d2) {
    return 0;
  }

  return d1.getTime() - d2.getTime();
}

/**
 * Get date range (start to end) in TODS format
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const start = parseFromTODS(startDate);
  const end = parseFromTODS(endDate);

  if (!start || !end) {
    return [];
  }

  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(formatToTODS(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Migrate old millisecond timestamp to TODS format
 * Used for migrating existing data
 */
export function migrateTimestampToTODS(value: any): string {
  // If already in TODS format, return as-is
  if (typeof value === 'string' && isValidTODSDate(value)) {
    return value;
  }

  // If it's a number (timestamp), convert
  if (typeof value === 'number') {
    return timestampToTODS(value);
  }

  // If it's a Date object, convert
  if (value instanceof Date) {
    return formatToTODS(value);
  }

  // Default to today
  console.warn('Could not migrate date value:', value);
  return getTodayTODS();
}
