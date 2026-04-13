import { formatInTimeZone } from 'date-fns-tz'

// Returns date in this format: 1 January 2024
// in UTC to avoid local timezone shifting the calendar day
export function formatDate(
  date: Date | string | number | undefined,
  formatStr = 'd MMMM yyyy',
) {
  if (!date) return ''
  const parsedDate =
    typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return formatInTimeZone(parsedDate, 'UTC', formatStr)
}
