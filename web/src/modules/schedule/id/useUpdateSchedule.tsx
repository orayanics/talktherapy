import { useState } from 'react'
import { addMonths, differenceInDays, format } from 'date-fns'
import { isAxiosError } from 'axios'
import type React from 'react'

import type { ParsedError } from '~/models/system'
import type {
  AvailabilityRuleWithSlots,
  CreateSchedulePayload,
  UpdateAvailabilityPayload,
} from '~/models/schedule'
import { useUpdateScheduleId } from '~/api/scheduling'
import { toISODateTime } from '~/utils/date'
import { buildRRule, parseRRule } from '~/utils/rrule'
import { parseError } from '~/utils/errors'

export default function useUpdateSchedule({
  data,
}: {
  data: AvailabilityRuleWithSlots
}) {
  const [errors, setErrors] = useState<ParsedError | null>(null)

  const parsed = parseRRule(data.recurrence_rule)

  const [form, setForm] = useState<CreateSchedulePayload>({
    date: format(new Date(data.starts_at), 'yyyy-MM-dd'),
    start_time: format(new Date(data.starts_at), 'HH:mm'),
    end_time: format(new Date(data.ends_at), 'HH:mm'),
    freq: parsed.freq ?? 'none',
    selected_days: parsed.byday,
    horizon_days: 1,
  })

  const updateMutation = useUpdateScheduleId(data.id)

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

      const payload: UpdateAvailabilityPayload = {
        starts_at: toISODateTime(form.date, form.start_time),
        ends_at: toISODateTime(form.date, form.end_time),
        horizon_days: horizonDays,
      }

      const rrule = buildRRule(form.freq, form.selected_days)
      if (rrule) payload.recurrence_rule = rrule

      await updateMutation.mutateAsync(payload)
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
    isLoading: updateMutation.isPending,
    handleChange,
    handleSubmit,
    toggleDay,
  }
}
