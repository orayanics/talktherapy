import { format, parseISO } from 'date-fns'

// formatToLocalDateTime returns in this format: "MM/dd/yyyy, h:mm:ss aa"
export function formatToLocalDateTime(dateString: string): string {
  return format(parseISO(dateString), 'MM/dd/yyyy, h:mm:ss aa')
}

// formatToLocalDate returns in this format: "MM/dd/yyyy"
export function formatToLocalDate(dateString: string): string {
  return format(parseISO(dateString), 'MM/dd/yyyy')
}

// formatToLocalTime returns in this format: "h:mm:ss aa"
export function formatToLocalTime(dateString: string): string {
  return format(parseISO(dateString), 'h:mm:ss aa')
}

// toISODateTime converts a date string ("YYYY-MM-DD") and time string ("HH:MM")
// into an ISO 8601 UTC string for API communication.
export function toISODateTime(date: string, time: string): string {
  return parseISO(`${date}T${time}:00`).toISOString()
}

// getDay returns the full weekday name ("Monday", "Tuesday", etc.)
export function getDay(dateString: string): string {
  return format(parseISO(dateString), 'EEEE')
}

// getTime returns time formatted as "hh:mm aa" (e.g. "02:30 PM")
export function getTime(dateString: string): string {
  return format(parseISO(dateString), 'hh:mm aa')
}

// todayUtcStr returns today's date as "YYYY-MM-DD" (UTC), suitable for HTML date input min attributes.
export function todayUtcStr(): string {
  return new Date().toISOString().slice(0, 10)
}
