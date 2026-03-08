import { addDays, addMilliseconds, parseISO, isBefore } from "date-fns";

/** Returns the current UTC instant. */
export const nowUtc = (): Date => new Date();

/**
 * Parses a "YYYY-MM-DD" date string to a UTC Date at 00:00:00.000.
 * Use for range lower bounds in database queries.
 */
export const toUtcStartOfDay = (dateStr: string): Date =>
  parseISO(`${dateStr}T00:00:00.000Z`);

/**
 * Parses a "YYYY-MM-DD" date string to a UTC Date at 23:59:59.999.
 * Use for range upper bounds in database queries.
 */
export const toUtcEndOfDay = (dateStr: string): Date =>
  parseISO(`${dateStr}T23:59:59.999Z`);

/**
 * Returns today's date as "YYYY-MM-DD" in UTC.
 * Useful for log export filenames, default date filters, etc.
 */
export const todayUtcStr = (): string => new Date().toISOString().slice(0, 10);

/** Adds milliseconds to a date (e.g. for computing token expiry). */
export const addMs = (date: Date, ms: number): Date =>
  addMilliseconds(date, ms);

/**
 * Returns the start of the given date in UTC (00:00:00.000 UTC).
 * Strips any time component by re-parsing via toISOString.
 */
export const utcStartOfDay = (date: Date): Date =>
  parseISO(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`);

// Re-export commonly used date-fns functions for uniform imports.
export { addDays, addMilliseconds, parseISO, isBefore };
