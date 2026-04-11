import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'

import { ScheduleSchema } from './schema'
import type { TSchedule } from './schema'

import { mutateSchedule } from '@/api/schedule'

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
      await scheduleMutation.mutateAsync(data)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data.message || 'Schedule creation failed'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
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
