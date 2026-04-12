import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { VerifyOtpSchema } from './schema'
import type { TVerifyOtp } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { mutateResendOtp, mutateVerifyOtp } from '@/api/activate'
import { isAxiosError } from 'axios'
import { useNavigate } from '@tanstack/react-router'

export default function useOtpForm({
  initialEmail,
}: {
  initialEmail?: string
}) {
  const [apiError, setApiError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isLoading },
  } = useForm<TVerifyOtp>({
    resolver: zodResolver(VerifyOtpSchema),
    defaultValues: {
      email: initialEmail ?? '',
      otp_code: '',
    },
  })

  const verifyOtpMutation = mutateVerifyOtp()
  const resendOtpMutation = mutateResendOtp()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      // get role from response and navigate accordingly
      const result = await verifyOtpMutation.mutateAsync(data)
      navigate({
        to: '/activate/otp/update',
        search: {
          otp: data.otp_code,
          email: data.email,
          ...(result?.role ? { role: result.role } : {}),
        },
      })
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
    isLoading: verifyOtpMutation.isPending || isLoading,
    isResending: resendOtpMutation.isPending,
  }
}
