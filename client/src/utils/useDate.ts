import { formatInTimeZone } from 'date-fns-tz'

// Returns date in this format: 1 January 2024
// in UTC to avoid local timezone shifting the calendar day
export function formatDate(
  date: Date | string | number | undefined | null,
  formatStr = 'd MMMM yyyy',
) {
  if (!date) return ''
  const parsedDate =
    typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return formatInTimeZone(parsedDate, 'UTC', formatStr)
}

export function getMonthRange(date: Date | string = new Date()) {
  const parsed = typeof date === 'string' ? new Date(`${date}T00:00:00Z`) : date
  const from = new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), 1),
  )
  const to = new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, 0),
  )
  return {
    from: formatDate(from, 'yyyy-MM-dd'),
    to: formatDate(to, 'yyyy-MM-dd'),
  }
}
