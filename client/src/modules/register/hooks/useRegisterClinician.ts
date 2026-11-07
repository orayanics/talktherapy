import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { RegisterClinicianSchema } from '../types/schema'
import type { TRegisterClinician } from '../types/schema'

import { useRegisterClinicianMutation } from '#/modules/register/hooks/useRegistrationMutations'

import { errMsg } from '#/lib/errorMessage'

export default function useRegisterClinician(onSuccess?: () => void) {
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

  const registerMutation = useRegisterClinicianMutation()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      await registerMutation.mutateAsync(data)
      reset()
      registerMutation.reset()
      onSuccess?.()
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Register clinician failed'))
    }
  })

  const resetState = () => {
    reset()
    setApiError(null)
    registerMutation.reset()
  }

  return {
    register,
    reset: resetState,
    onSubmit,
    errors,
    apiError,
    isLoading: registerMutation.isPending || isSubmitting,
  }
}
