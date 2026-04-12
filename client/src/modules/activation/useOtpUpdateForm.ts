import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ActivateAccountSchema } from './schema'
import type { TActivateAccount } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { mutateActivateAccount, mutateResendOtp } from '@/api/activate'
import { isAxiosError } from 'axios'
import { useNavigate } from '@tanstack/react-router'

export default function useOtpUpdateForm({
  otp,
  initialEmail,
}: {
  otp: string
  initialEmail?: string
}) {
  const [apiError, setApiError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isLoading },
  } = useForm<TActivateAccount>({
    resolver: zodResolver(ActivateAccountSchema),
    defaultValues: {
      email: initialEmail ?? '',
      otp_code: otp,
      diagnosis_id: '', // for clinician ONLY
      name: '',
      password: '',
      password_confirmation: '',
    },
  })

  const activateAccountMutation = mutateActivateAccount()
  const resendOtpMutation = mutateResendOtp()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      await activateAccountMutation.mutateAsync(data)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.error || 'OTP verification failed'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
    }
  })

  const onResend = async () => {
    setApiError(null)
    const email = getValues('email')?.trim()

    if (!email) {
      setApiError('Email is required to resend OTP')
      return
    }

    try {
      await resendOtpMutation.mutateAsync({ email })
      navigate({
        to: '/activate/otp',
        search: {
          email,
        },
      })
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.error || 'Failed to resend OTP'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
    }
  }

  return {
    register,
    onSubmit,
    onResend,
    errors,
    apiError,
    isLoading: activateAccountMutation.isPending || isLoading,
    isResending: resendOtpMutation.isPending,
  }
}
