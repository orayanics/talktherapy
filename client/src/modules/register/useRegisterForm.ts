import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'

import { RegisterPatientSchema } from './schema'
import type { TRegisterPatient } from './schema'

import { mutateRegisterPatient } from '@/api/register'

export default function useRegisterForm() {
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TRegisterPatient>({
    resolver: zodResolver(RegisterPatientSchema),
    defaultValues: {
      name: '',
      diagnosis_id: '',
      email: '',
      password: '',
      password_confirmation: '',
      consent: false,
    },
  })

  const registerMutation = mutateRegisterPatient()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      await registerMutation.mutateAsync(data)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message = error.response?.data || 'Login failed'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
    }
  })

  return {
    register,
    onSubmit,
    errors,
    apiError,
    isLoading: registerMutation.isPending || isSubmitting,
  }
}
