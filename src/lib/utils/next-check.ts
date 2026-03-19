/**
 * Calculate the next check date from the last check and interval.
 * Used when the user doesn't override the next check date.
 */

/**
 * Returns the next check due date (ISO string) given the last check date and interval in days.
 */
export function getNextCheckDue(lastCheckDate: string, intervalDays: number): string {
  const date = new Date(lastCheckDate);
  date.setDate(date.getDate() + intervalDays);
  return date.toISOString().split("T")[0]!;
}

/**
 * Default check interval in days (e.g. weekly = 7).
 */
export const DEFAULT_CHECK_INTERVAL_DAYS = 7;
