import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ActivateAccountSchema } from './schema'
import type { TActivateAccount } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { mutateActivateAccount } from '@/api/activate'
import { isAxiosError } from 'axios'

export default function useOtpUpdateForm({ otp }: { otp: string }) {
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<TActivateAccount>({
    resolver: zodResolver(ActivateAccountSchema),
    defaultValues: {
      email: '',
      otp_code: otp,
      diagnosis_id: '', // for clinician ONLY
      name: '',
      password: '',
      password_confirmation: '',
    },
  })

  const activateAccountMutation = mutateActivateAccount()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      await activateAccountMutation.mutateAsync(data)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data.message || 'OTP verification failed'
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
    isLoading: activateAccountMutation.isPending || isLoading,
  }
}
