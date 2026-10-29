import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { RegisterPatientSchema } from '../types/schema'
import type { TRegisterPatient } from '../types/schema'

import { mutateRegisterPatient } from '#/modules/register/api/register'
import { errMsg } from '#/lib/errorMessage'

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
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Registration failed'))
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
