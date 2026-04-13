import type { Frequency, DayCode } from '@/modules/schedules/ScheduleForm'

export function buildRRule(
  freq: Frequency,
  days: Set<DayCode>,
  count: number,
): string {
  if (freq === 'none') return ''
  let rule = `FREQ=${freq.toUpperCase()}`
  if (freq === 'weekly' && days.size > 0) {
    rule += `;BYDAY=${[...days].join(',')}`
  }
  rule += `;COUNT=${count}`
  return rule
}

const RRULE_PATTERN = /^[A-Z]+=.+(?:;[A-Z]+=.+)*$/

export function validateRRule(raw: string): string | null {
  if (!raw) return null
  if (!RRULE_PATTERN.test(raw)) return 'Invalid RRULE format'
  return null
}
