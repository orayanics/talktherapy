import type { TDayCode } from './schema'

const DAY_CODE_TO_JS_DAY: Record<TDayCode, number> = {
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
  SU: 0,
}

export function expandOccurrences(
  startISO: string | undefined | null,
  rrule: string,
  limit = 365,
): Date[] {
  if (!startISO) return []
  const start = new Date(startISO)
  if (isNaN(start.getTime())) return []
  if (!rrule) return [start]

  const pairs = rrule.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split('=')
    if (key && value) acc[key] = value
    return acc
  }, {})

  const freqVal = pairs['FREQ']
  const count = Math.min(parseInt(pairs['COUNT'] ?? '10', 10) || 10, limit)
  const byDayRaw = pairs['BYDAY']
  const byDayCodes = byDayRaw ? (byDayRaw.split(',') as TDayCode[]) : undefined
  const allowedJsDays =
    byDayCodes && byDayCodes.length > 0
      ? new Set(byDayCodes.map((code) => DAY_CODE_TO_JS_DAY[code]))
      : null

  const dates: Date[] = []
  const cur = new Date(start)
  let iterations = 0

  while (dates.length < count && iterations < 2000) {
    iterations++
    const include = !allowedJsDays || allowedJsDays.has(cur.getDay())
    if (include) dates.push(new Date(cur))

    if (freqVal === 'DAILY') cur.setDate(cur.getDate() + 1)
    else if (freqVal === 'WEEKLY') cur.setDate(cur.getDate() + 1)
    else if (freqVal === 'MONTHLY') cur.setMonth(cur.getMonth() + 1)
    else break
  }

  return dates
}

export default expandOccurrences
