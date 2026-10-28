import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { ScheduleSchema } from '../types/schema'
import type { TSchedule } from '../types/schema'

import { mutateSchedule } from '#/modules/schedules/api/schedules'
import { errMsg } from '#/lib/errorMessage'

export default function useScheduleForm() {
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TSchedule>({
    resolver: zodResolver(ScheduleSchema),
    defaultValues: {
      start_at: '',
      end_at: '',
      recurrence_rule: null,
    },
  })

  const scheduleMutation = mutateSchedule()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      await scheduleMutation.mutateAsync({
        start_at: new Date(`${data.start_at}:00Z`).toISOString(),
        end_at: new Date(`${data.end_at}:00Z`).toISOString(),
        recurrence_rule: data.recurrence_rule ?? null,
        timezone: 'UTC',
      })
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Schedule creation failed'))
    }
  })

  return {
    register,
    setValue,
    watch,
    reset,
    onSubmit,
    errors,
    apiError,
    isLoading: scheduleMutation.isPending || isSubmitting,
  }
}
