/**
 * Formats a date string to the user's local timezone
 * @param dateString - ISO date string from the backend
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in user's local timezone
 */
export function formatDate(
  dateString: string | undefined | null,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!dateString) return "";

  // Remove 'Z' suffix if present - backend stores times in local timezone
  const cleanedDateString = dateString.trim().replace(/Z$/, "");
  const date = new Date(cleanedDateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date string:", dateString);
    return "";
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return date.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Formats a date and time string to the user's local timezone
 * @param dateString - ISO date string from the backend
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date and time string in user's local timezone
 */
export function formatDateTime(
  dateString: string | undefined | null,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!dateString) return "";

  // Remove 'Z' suffix if present - backend stores times in local timezone
  const cleanedDateString = dateString.trim().replace(/Z$/, "");
  const date = new Date(cleanedDateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date string:", dateString);
    return "";
  }

  // Add 12 hours to fix backend time storage issue
  date.setHours(date.getHours() + 12);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  };

  return date.toLocaleString(undefined, defaultOptions);
}

/**
 * Formats a date to short format (MM/DD/YYYY) in user's local timezone
 * @param dateString - ISO date string from the backend
 * @returns Short formatted date string
 */
export function formatDateShort(dateString: string | undefined | null): string {
  return formatDate(dateString, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a date for input fields (YYYY-MM-DD) in user's local timezone
 * @param dateString - ISO date string from the backend
 * @returns Date string formatted for input fields
 */
export function formatDateForInput(
  dateString: string | undefined | null,
): string {
  if (!dateString) return "";

  // Simply extract the date part (YYYY-MM-DD) without timezone conversion
  // Input format: 2026-02-10T00:00:00.000Z
  // Output format: 2026-02-10
  const datePart = dateString.trim().split("T")[0];

  return datePart;
}

/**
 * Converts a date input value (YYYY-MM-DD) to ISO string for backend
 * @param dateInputValue - Date string from input field (YYYY-MM-DD)
 * @returns ISO date string adjusted for backend timezone expectations
 */
export function formatDateFromInput(dateInputValue: string): string {
  if (!dateInputValue) return "";

  // Create date at midnight UTC
  const date = new Date(`${dateInputValue}T00:00:00.000Z`);

  // Add 6 hours to compensate for GMT+6 timezone offset
  // When backend receives this UTC time, it will convert back to GMT+6
  // resulting in the correct date at midnight local time
  date.setHours(date.getHours() + 6);

  return date.toISOString();
}
