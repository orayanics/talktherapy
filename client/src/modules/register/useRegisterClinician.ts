import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'

import { RegisterClinicianSchema } from './schema'
import type { TRegisterClinician } from './schema'

import { mutateRegisterClinician } from '@/api/register'

export default function useRegisterClinician() {
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TRegisterClinician>({
    resolver: zodResolver(RegisterClinicianSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      diagnosis_id: '',
    },
  })

  const registerMutation = mutateRegisterClinician()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      await registerMutation.mutateAsync(data)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.error || 'Register clinician failed'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
    }
  })

  return {
    register,
    reset,
    onSubmit,
    errors,
    apiError,
    isLoading: registerMutation.isPending || isSubmitting,
  }
}
