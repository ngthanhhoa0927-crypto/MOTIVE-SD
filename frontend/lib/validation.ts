/**
 * Validates an email address using a standard regex.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a date string in the format dd/mm/yyyy.
 * Ensures the date is a real calendar date (e.g., handles leap years).
 */
export function isValidDate(dateStr: string): boolean {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateStr.match(dateRegex);

  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;

  // Add a reasonable year range check (e.g., 1900 to current year + some buffer if needed)
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return false;

  return true;
}
