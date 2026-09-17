/**
 * YellowHouse Tailoring OS — Date and Time Utilities
 * Provides ISO formatting, human-readable relative time, and hardened overdue date calculations.
 */

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(?:T.*)?$/;
const FULL_DATE_REGEX = /^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})$/i;
const FULL_DATE_REV_REGEX = /^(\d{1,2})\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})$/i;
const SHORT_DATE_REGEX = /^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})$/i;
const SHORT_DATE_REV_REGEX = /^(\d{1,2})\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*$/i;

/**
 * Formats an ISO date string into human-readable relative time.
 * Supports optional mockNowMs for deterministic unit testing.
 */
export function formatRelativeTime(isoString: string, mockNowMs?: number): string {
  const now = mockNowMs !== undefined ? mockNowMs : Date.now();
  const diff = now - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Safely parses order due dates supporting ISO ('2026-08-15'), full ('Aug 15, 2026'),
 * and short month-day ('Aug 15', '15 Aug') formats.
 * Malformed or non-date strings ('INVALID-DATE', 'PENDING', '9999-99-99') return null.
 */
export function parseDueDate(
  dueDateStr: string | undefined | null,
  referenceYear: number = new Date().getFullYear()
): Date | null {
  if (!dueDateStr || typeof dueDateStr !== 'string') return null;
  const trimmed = dueDateStr.trim();
  if (!trimmed) return null;

  // 1. ISO Date string (e.g. 2026-08-15)
  if (ISO_DATE_REGEX.test(trimmed)) {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    if (year < 1900 || year > 2100) return null;
    return d;
  }

  // 2. Full Month-Day-Year string (e.g. Aug 15, 2026 or 15 Aug 2026)
  if (FULL_DATE_REGEX.test(trimmed) || FULL_DATE_REV_REGEX.test(trimmed)) {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    if (year < 1900 || year > 2100) return null;
    return d;
  }

  // 3. Short Month-Day string (e.g. 'Aug 15', 'Aug 8', '15 Aug')
  if (SHORT_DATE_REGEX.test(trimmed) || SHORT_DATE_REV_REGEX.test(trimmed)) {
    const d = new Date(`${trimmed}, ${referenceYear}`);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  // All other non-date strings are rejected
  return null;
}

/**
 * Determines whether an order is overdue relative to a reference date.
 * Correctly rejects non-date strings without V8 date coercion bugs.
 */
export function isOrderOverdue(
  dueDateStr: string | undefined | null,
  referenceDate: string | Date = new Date(),
  createdAtStr?: string
): boolean {
  if (!dueDateStr) return false;

  const ref = typeof referenceDate === 'string' ? new Date(referenceDate) : new Date(referenceDate.getTime());
  if (isNaN(ref.getTime())) return false;
  ref.setHours(0, 0, 0, 0);

  // If order creation date exists, use its year as reference for short dates
  const refYear = createdAtStr ? new Date(createdAtStr).getFullYear() : ref.getFullYear();
  const dDate = parseDueDate(dueDateStr, isNaN(refYear) ? ref.getFullYear() : refYear);
  if (!dDate) return false;

  dDate.setHours(0, 0, 0, 0);
  return dDate < ref;
}

/**
 * Calculates days overdue (returns 0 if not overdue or invalid).
 */
export function computeDaysOverdue(
  dueDateStr: string | undefined | null,
  referenceDate: string | Date = new Date(),
  createdAtStr?: string
): number {
  if (!dueDateStr) return 0;

  const ref = typeof referenceDate === 'string' ? new Date(referenceDate) : new Date(referenceDate.getTime());
  if (isNaN(ref.getTime())) return 0;
  ref.setHours(0, 0, 0, 0);

  const refYear = createdAtStr ? new Date(createdAtStr).getFullYear() : ref.getFullYear();
  const dDate = parseDueDate(dueDateStr, isNaN(refYear) ? ref.getFullYear() : refYear);
  if (!dDate) return 0;

  dDate.setHours(0, 0, 0, 0);
  if (dDate >= ref) return 0;

  const diffTime = ref.getTime() - dDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return isNaN(diffDays) ? 1 : diffDays;
}

/**
 * Alias for computeDaysOverdue
 */
export const getDaysOverdue = computeDaysOverdue;
