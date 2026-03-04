import { useState } from 'react'
import { addMonths, differenceInDays } from 'date-fns'
import { isAxiosError } from 'axios'
import type React from 'react'
import type { ParsedError } from '~/models/system'
import type {
  CreateAvailabilityPayload,
  CreateSchedulePayload,
} from '~/models/payloads'
import { useCreateSchedule } from '~/api/scheduling'
import { toISODateTime } from '~/utils/date'
import { buildRRule } from '~/utils/rrule'
import { parseError } from '~/utils/errors'

export default function useSchedule() {
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const [form, setForm] = useState<CreateSchedulePayload>({
    date: '',
    start_time: '',
    end_time: '',
    freq: 'none',
    selected_days: [],
    horizon_days: 1,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      selected_days: prev.selected_days.includes(day)
        ? prev.selected_days.filter((d) => d !== day)
        : [...prev.selected_days, day],
    }))
    setErrors(null)
  }

  const scheduleMutation = useCreateSchedule()

  async function handleSubmit() {
    setErrors(null)

    try {
      const days = parseInt(form.horizon_days.toString(), 10)
      const horizonDays =
        form.freq === 'MONTHLY'
          ? differenceInDays(
              addMonths(new Date(form.date), days),
              new Date(form.date),
            )
          : days

      const payload: CreateAvailabilityPayload = {
        starts_at: toISODateTime(form.date, form.start_time),
        ends_at: toISODateTime(form.date, form.end_time),
        horizon_days: horizonDays,
      }

      const rrule = buildRRule(form.freq, form.selected_days)
      if (rrule) payload.recurrence_rule = rrule

      await scheduleMutation.mutateAsync(payload)
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        setErrors(parseError(error.response?.data ?? null))
      } else {
        setErrors(null)
      }
    }
  }

  return {
    form,
    errors,
    isLoading: scheduleMutation.isPending,
    handleChange,
    handleSubmit,
    toggleDay,
  }
}
