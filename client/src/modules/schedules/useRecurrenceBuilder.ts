import { useEffect, useMemo, useState } from 'react'
import { buildRRule, validateRRule } from '@/utils/rrule'
import expandOccurrences from './expandOccurrences'
import type { TFrequency, TDayCode } from './schema'

type TDayMeta = Readonly<{ code: TDayCode; label: string; jsDay: number }>

export const DAY_CODES: readonly TDayMeta[] = [
  { code: 'MO', label: 'Mo', jsDay: 1 },
  { code: 'TU', label: 'Tu', jsDay: 2 },
  { code: 'WE', label: 'We', jsDay: 3 },
  { code: 'TH', label: 'Th', jsDay: 4 },
  { code: 'FR', label: 'Fr', jsDay: 5 },
  { code: 'SA', label: 'Sa', jsDay: 6 },
  { code: 'SU', label: 'Su', jsDay: 0 },
]

export interface TRecurrenceBuilder {
  freq: TFrequency
  handleFreqChange: (next: TFrequency) => void
  selectedDays: Set<TDayCode>
  toggleDay: (dayCode: TDayCode) => void
  count: number
  setCount: (next: number) => void
  rruleRaw: string
  rruleErr: string | null
  occurrences: Date[]
  occurrencesPreview: Date[]
  remaining: number
  DAY_CODES: readonly TDayMeta[]
}

const clampCount = (next: number) => Math.max(1, Math.min(365, next || 1))

export function useRecurrenceBuilder(
  startAt?: string | null,
): TRecurrenceBuilder {
  const [freq, setFreq] = useState<TFrequency>('none')
  const [selectedDays, setSelectedDays] = useState<Set<TDayCode>>(new Set())
  const [count, setCount] = useState<number>(12)
  const [rruleRaw, setRruleRaw] = useState('')
  const rruleErr = validateRRule(rruleRaw)

  useEffect(() => {
    setRruleRaw(buildRRule(freq, selectedDays, count))
  }, [freq, selectedDays, count])

  const toggleDay = (code: TDayCode) => {
    setSelectedDays((prev) => {
      const next = new Set(prev)
      next.has(code) ? next.delete(code) : next.add(code)
      return next
    })
  }

  const handleFreqChange = (next: TFrequency) => {
    setFreq(next)
    if (next !== 'weekly') setSelectedDays(new Set())
  }

  const setSafeCount = (next: number) => setCount(clampCount(next))

  const occurrences = useMemo(
    () => expandOccurrences(startAt ?? '', rruleRaw, 365),
    [startAt, rruleRaw],
  )

  const occurrencesPreview = occurrences.slice(0, 10)
  const remaining = occurrences.length - occurrencesPreview.length

  return {
    freq,
    handleFreqChange,
    selectedDays,
    toggleDay,
    count,
    setCount: setSafeCount,
    rruleRaw,
    rruleErr,
    occurrences,
    occurrencesPreview,
    remaining,
    DAY_CODES,
  }
}

export default useRecurrenceBuilder
