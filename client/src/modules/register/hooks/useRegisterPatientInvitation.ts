import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterPatientInvitationSchema } from '#/modules/register/types/schema'
import type { TRegisterPatientInvitation } from '#/modules/register/types/schema'
import { mutateRegisterPatientInvitation } from '#/modules/register/api/register'
import { errMsg } from '#/lib/errorMessage'

export default function useRegisterPatientInvitation() {
  const [apiError, setApiError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TRegisterPatientInvitation>({
    resolver: zodResolver(RegisterPatientInvitationSchema),
    defaultValues: { name: '', email: '' },
  })
  const mutation = mutateRegisterPatientInvitation()
  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)
    try {
      await mutation.mutateAsync(data)
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Patient invitation failed'))
    }
  })

  return {
    register,
    reset,
    onSubmit,
    errors,
    apiError,
    isLoading: mutation.isPending || isSubmitting,
  }
}
