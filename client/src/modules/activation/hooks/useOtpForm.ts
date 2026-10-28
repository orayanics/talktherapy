import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { VerifyOtpSchema } from '../types/schema'
import type { TVerifyOtp } from '../types/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  mutateActivateAccount,
  mutateResendOtp,
  mutateVerifyOtp,
} from '#/modules/activation/api/activate'
import { useNavigate } from '@tanstack/react-router'
import { errMsg } from '#/lib/errorMessage'

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
  const activateAccountMutation = mutateActivateAccount()
  const resendOtpMutation = mutateResendOtp()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      // get role from response and navigate accordingly
      const result = await verifyOtpMutation.mutateAsync(data)

      if (result?.role === 'patient') {
        await activateAccountMutation.mutateAsync({
          email: data.email,
          otp_code: data.otp_code,
        })
        return
      }

      navigate({
        to: '/activate/otp/update',
        search: {
          otp: data.otp_code,
          email: data.email,
          role: result.role,
        },
      })
    } catch (error: unknown) {
      setApiError(errMsg(error, 'OTP verification failed'))
    }
  })

  const onResend = async () => {
    setApiError(null)
    const email = getValues('email').trim()

    if (!email) {
      setApiError('Email is required to resend OTP')
      return
    }

    try {
      await resendOtpMutation.mutateAsync({ email })
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Failed to resend OTP'))
    }
  }

  return {
    register,
    onSubmit,
    onResend,
    errors,
    apiError,
    isLoading:
      verifyOtpMutation.isPending ||
      activateAccountMutation.isPending ||
      isLoading,
    isResending: resendOtpMutation.isPending,
  }
}
