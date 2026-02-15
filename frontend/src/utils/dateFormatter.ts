/**
 * Get the browser's timezone offset in hours
 * @returns Timezone offset in hours (e.g., 6 for GMT+6, -5 for GMT-5)
 */
function getTimezoneOffsetHours(): number {
  // getTimezoneOffset() returns minutes, negative for positive offsets
  // For GMT+6, it returns -360, so we divide by -60 to get 6
  return -new Date().getTimezoneOffset() / 60;
}

/**
 * Formats a date string to the user's local timezone
 * @param dateString - ISO date string from the backend (UTC)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in user's local timezone
 */
export function formatDate(
  dateString: string | undefined | null,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!dateString) return "";

  const date = new Date(dateString.trim());

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date string:", dateString);
    return "";
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...options,
  };

  return date.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Formats a date and time string to the user's local timezone
 * @param dateString - ISO date string from the backend (UTC)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date and time string in user's local timezone
 */
export function formatDateTime(
  dateString: string | undefined | null,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!dateString) return "";

  const date = new Date(dateString.trim());

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date string:", dateString);
    return "";
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
 * Formats a local Date as YYYY-MM-DD for date inputs.
 */
export function formatLocalDateForInput(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Converts a date input value (YYYY-MM-DD) to an ISO string at local end-of-day.
 */
export function formatDateInputToLocalEndOfDayIso(
  dateInputValue: string,
): string {
  if (!dateInputValue) return "";

  const [yearText, monthText, dayText] = dateInputValue.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) return "";

  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
}

export function isDateInputTodayOrFuture(dateInputValue: string): boolean {
  if (!dateInputValue) return false;

  return dateInputValue >= formatLocalDateForInput();
}

export function isDueAtNotPassed(dueAt: string | undefined | null): boolean {
  if (!dueAt) return true;

  const parsed = new Date(dueAt);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.getTime() >= Date.now();
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

  // Dynamically get timezone offset and add to compensate
  // When backend receives this UTC time, it will convert back to local timezone
  // resulting in the correct date at midnight local time
  const timezoneOffset = getTimezoneOffsetHours();
  date.setHours(date.getHours() + timezoneOffset);

  return date.toISOString();
}
