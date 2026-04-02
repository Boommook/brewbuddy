// calculate the next check date from the last check and interval.
// used when the user doesn't override the next check date.

// returns the next check due date (iso string) given the last check date and interval in days.
export function getNextCheckDue(lastCheckDate: string, intervalDays: number): string {
  const date = new Date(lastCheckDate);
  date.setDate(date.getDate() + intervalDays);
  return date.toISOString().split("T")[0]!;
}

// default check interval in days. I check my batches weekly, so this is 7
export const DEFAULT_CHECK_INTERVAL_DAYS = 7;
