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

  // Remove 'Z' suffix if present - backend stores times in local timezone
  const cleanedDateString = dateString.trim().replace(/Z$/, "");
  const date = new Date(cleanedDateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date string:", dateString);
    return "";
  }

  // Get local date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
