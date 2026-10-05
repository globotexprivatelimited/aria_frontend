/**
 * Utility functions for formatting dates, time, currency, etc.
 */

/**
 * Returns human-readable relative time (e.g. "4m ago", "12s ago", "2d ago")
 */
export function timeAgo(isoOrDate: string | Date | number): string {
  const time = typeof isoOrDate === "string" ? new Date(isoOrDate).getTime() : new Date(isoOrDate).getTime();
  const s = Math.floor((Date.now() - time) / 1000);
  if (s < 60) return `${Math.max(1, s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/**
 * Formats hour number (0..23) to short format ("12a", "3p", etc.)
 */
export function formatHourShort(h: number): string {
  if (h === 0) return "12a";
  if (h < 12) return `${h}a`;
  if (h === 12) return "12p";
  return `${h - 12}p`;
}

/**
 * Formats date into luxury hotel date string (e.g. "Monday, Oct 5, 2026")
 */
export function formatLuxuryDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
