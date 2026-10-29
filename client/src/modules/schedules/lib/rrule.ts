import type { TDayCode, TFrequency } from '#/modules/schedules/types/schema'

export { validateRRule } from './expandOccurrences'

export function buildRRule(
  freq: TFrequency,
  days: Set<TDayCode>,
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
