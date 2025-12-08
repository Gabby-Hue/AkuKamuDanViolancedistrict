/**
 * Time formatting helpers with Jakarta timezone (UTC+7)
 */

// Timezone constants
export const TIMEZONE = 'Asia/Jakarta';

/**
 * Format time to HH:mm format with Jakarta timezone
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  });
}

/**
 * Format date to Indonesian locale with Jakarta timezone
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('id-ID', {
    timeZone: TIMEZONE,
  });
}

/**
 * Format date to only date part with Jakarta timezone
 */
export function formatDateOnly(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('id-ID', {
    timeZone: TIMEZONE,
  });
}

/**
 * Format date to short time format (DD/MM) with Jakarta timezone
 */
export function formatShortDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    timeZone: TIMEZONE,
  });
}

/**
 * Create date object in Jakarta timezone
 */
export function createDateInJakarta(dateString: string): Date {
  const date = new Date(dateString);
  // Convert to Jakarta timezone by adding the timezone offset
  const jakartaOffset = 7 * 60; // 7 hours in minutes
  const localOffset = date.getTimezoneOffset();
  const totalOffset = (localOffset + jakartaOffset) * 60 * 1000;
  return new Date(date.getTime() + totalOffset);
}