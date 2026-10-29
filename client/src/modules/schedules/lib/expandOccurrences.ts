import type { TDayCode } from '../types/schema'

const DAY_CODE_TO_JS_DAY: Record<TDayCode, number> = {
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
  SU: 0,
}

const WEEKDAYS = Object.keys(DAY_CODE_TO_JS_DAY)

function parseStart(value: string): Date | null {
  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
    ? `${value}:00Z`
    : value
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

function parseRule(rule: string): Record<string, string> | null {
  const parts: Record<string, string> = {}
  for (const clause of rule.split(';')) {
    const [key, value, ...extra] = clause.split('=')
    if (!key || !value || extra.length || key in parts) return null
    if (!['FREQ', 'INTERVAL', 'BYDAY', 'COUNT', 'UNTIL'].includes(key))
      return null
    parts[key] = value
  }

  if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(parts['FREQ'] ?? '')) return null
  if (parts['INTERVAL'] && !/^[1-9]\d*$/.test(parts['INTERVAL'])) return null
  if (parts['INTERVAL'] && Number(parts['INTERVAL']) > 365) return null
  if (Boolean(parts['COUNT']) === Boolean(parts['UNTIL'])) return null
  if (
    parts['COUNT'] &&
    (!/^[1-9]\d*$/.test(parts['COUNT']) || Number(parts['COUNT']) > 365)
  )
    return null

  if (parts['BYDAY']) {
    const days = parts['BYDAY'].split(',')
    if (
      parts['FREQ'] !== 'WEEKLY' ||
      days.some((day) => !WEEKDAYS.includes(day)) ||
      new Set(days).size !== days.length
    )
      return null
  }

  if (parts['UNTIL']) {
    if (!/^\d{8}T\d{6}Z$/.test(parts['UNTIL'])) return null
    const until = untilDate(parts['UNTIL'])
    if (!until) return null
  }

  return parts
}

function untilDate(value: string): Date | null {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/)
  if (!match) return null
  const [, year, month, day, hour, minute, second] = match
  const date = new Date(
    Date.UTC(+year, +month - 1, +day, +hour, +minute, +second),
  )
  return date.toISOString() ===
    `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`
    ? date
    : null
}

export function validateRRule(
  rule: string,
  startISO?: string | null,
): string | null {
  if (!rule) return null
  const parts = parseRule(rule)
  if (!parts) return 'Use a supported, finite recurrence rule.'
  if (!startISO) return null

  const start = parseStart(startISO)
  if (!start) return 'Enter a valid UTC start date and time.'
  const dates = expandOccurrences(startISO, rule, 366)
  if (dates.length === 0)
    return 'The recurrence has no occurrence within one year.'

  const horizon = new Date(start)
  horizon.setUTCFullYear(horizon.getUTCFullYear() + 1)
  if (dates.at(-1)!.getTime() > horizon.getTime()) {
    return 'The recurrence must end within one year of its start.'
  }

  if (parts['COUNT'] && dates.length !== Number(parts['COUNT'])) {
    return 'The recurrence must produce all occurrences within one year.'
  }

  if (dates.length > 365)
    return 'The recurrence cannot produce more than 365 occurrences.'

  return null
}

export function expandOccurrences(
  startISO: string | undefined | null,
  rrule: string,
  limit = 365,
): Date[] {
  if (!startISO) return []
  const start = parseStart(startISO)
  if (!start) return []
  if (!rrule) return [start]

  const parts = parseRule(rrule)
  if (!parts) return []

  const cap = Math.min(Math.max(Math.floor(limit), 0), 366)
  if (cap === 0) return []
  const interval = Number(parts['INTERVAL'] ?? 1)
  const count = Math.min(Number(parts['COUNT'] ?? cap), cap)
  const until = parts['UNTIL'] ? untilDate(parts['UNTIL']) : null
  const dates: Date[] = []

  if (parts['FREQ'] === 'MONTHLY') {
    for (
      let monthOffset = 0;
      monthOffset <= interval * 365 && dates.length < count;
      monthOffset += interval
    ) {
      const candidate = new Date(start)
      candidate.setUTCDate(1)
      candidate.setUTCMonth(candidate.getUTCMonth() + monthOffset)
      candidate.setUTCDate(start.getUTCDate())
      if (candidate.getUTCDate() !== start.getUTCDate()) continue
      if (until && candidate > until) break
      dates.push(candidate)
    }

    return dates
  }

  const monday = new Date(start)
  const offset = (monday.getUTCDay() + 6) % 7
  monday.setUTCDate(monday.getUTCDate() - offset)
  const allowedDays = parts['BYDAY']
    ? parts['BYDAY']
        .split(',')
        .map((day) => DAY_CODE_TO_JS_DAY[day as TDayCode])
    : []

  for (
    let dayOffset = 0;
    dayOffset <= 366 && dates.length < count;
    dayOffset++
  ) {
    const candidate = new Date(start)
    candidate.setUTCDate(candidate.getUTCDate() + dayOffset)
    if (until && candidate > until) break

    const isDailyOccurrence =
      parts['FREQ'] === 'DAILY' && dayOffset % interval === 0
    const weekStart = new Date(candidate)
    weekStart.setUTCDate(
      weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7),
    )
    const weekOffset = Math.round(
      (weekStart.getTime() - monday.getTime()) / 86_400_000 / 7,
    )
    const isWeeklyOccurrence =
      parts['FREQ'] === 'WEEKLY' &&
      weekOffset % interval === 0 &&
      (allowedDays.length > 0
        ? allowedDays.includes(candidate.getUTCDay())
        : candidate.getUTCDay() === start.getUTCDay())

    if (isDailyOccurrence || isWeeklyOccurrence) {
      dates.push(candidate)
    }
  }

  return dates
}

export default expandOccurrences
