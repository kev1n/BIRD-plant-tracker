/**
 * Parses a date string as a local date, ignoring timezone issues
 * This prevents dates from shifting due to UTC interpretation
 */
export function parseDateAsLocal(dateString: string | Date): Date {
  if (dateString instanceof Date) {
    return dateString;
  }
  
  if (!dateString) {
    return new Date();
  }

  // If the date string includes time information, parse it normally
  if (dateString.includes('T') || dateString.includes(' ')) {
    return new Date(dateString);
  }
  
  // For date-only strings (YYYY-MM-DD), parse as local date to avoid timezone shifts
  const date = new Date(dateString + 'T00:00:00');
  
  // If that doesn't work, try manual parsing
  if (isNaN(date.getTime())) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Month is 0-indexed
      const day = parseInt(parts[2]);
      return new Date(year, month, day);
    }
  }
  
  return date;
}

/**
 * Formats a date for display, ensuring consistent local time interpretation
 */
export function formatDateForDisplay(dateString: string | Date, options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}): string {
  const date = parseDateAsLocal(dateString);
  return date.toLocaleDateString('en-US', options);
} 