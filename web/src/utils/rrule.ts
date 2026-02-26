import type { Freq } from '~/models/schedule'

export const DAYS = [
  { label: 'Mon', value: 'MO' },
  { label: 'Tue', value: 'TU' },
  { label: 'Wed', value: 'WE' },
  { label: 'Thu', value: 'TH' },
  { label: 'Fri', value: 'FR' },
  { label: 'Sat', value: 'SA' },
  { label: 'Sun', value: 'SU' },
]

export function buildRRule(
  freq: Freq,
  selectedDays: Array<string>,
): string | undefined {
  if (freq === 'none') return undefined
  if (freq === 'WEEKLY' && selectedDays.length > 0) {
    return `FREQ=WEEKLY;BYDAY=${selectedDays.join(',')}`
  }
  return `FREQ=${freq}`
}

export function parseRRule(rrule?: string | null): {
  freq: Freq | null
  byday: Array<string>
} {
  if (!rrule || typeof rrule !== 'string') {
    return { freq: null, byday: [] }
  }

  const parts = rrule
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)

  const freqPart = parts.find((part) => part.startsWith('FREQ='))
  const bydayPart = parts.find((part) => part.startsWith('BYDAY='))

  const freqValue = freqPart?.split('=')[1]?.trim()
  const bydayValue = bydayPart?.split('=')[1]

  const freq = freqValue ? (freqValue as Freq) : null

  const byday =
    typeof bydayValue === 'string' && bydayValue.length > 0
      ? bydayValue
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean)
      : []

  return { freq, byday }
}
