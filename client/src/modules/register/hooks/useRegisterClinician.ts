import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { RegisterClinicianSchema } from '../types/schema'
import type { TRegisterClinician } from '../types/schema'

import { mutateRegisterClinician } from '#/modules/register/api/register'
import { errMsg } from '#/lib/errorMessage'

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
    },
  })

  const registerMutation = mutateRegisterClinician()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      await registerMutation.mutateAsync(data)
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Register clinician failed'))
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
