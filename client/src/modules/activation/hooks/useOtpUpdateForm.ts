import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { ActivateAccountSchema } from '../types/schema'
import type { TActivateAccount } from '../types/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  mutateActivateAccount,
  mutateResendOtp,
} from '#/modules/activation/api/activate'
import { useNavigate } from '@tanstack/react-router'
import { errMsg } from '#/lib/errorMessage'

export default function useOtpUpdateForm({
  otp,
  initialEmail,
  role,
  requiresCredentials = false,
}: {
  otp: string
  initialEmail?: string
  role?: string
  requiresCredentials?: boolean
}) {
  const [apiError, setApiError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isLoading },
  } = useForm<TActivateAccount>({
    resolver: zodResolver(ActivateAccountSchema) as Resolver<TActivateAccount>,
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
  const isPatient = role?.toLowerCase() === 'patient'

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      const payload =
        isPatient && !requiresCredentials
          ? {
              email: data.email,
              otp_code: data.otp_code,
            }
          : data
      await activateAccountMutation.mutateAsync(payload)
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
      navigate({
        to: '/activate/otp',
        search: {
          email,
        },
      })
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
    isLoading: activateAccountMutation.isPending || isLoading,
    isResending: resendOtpMutation.isPending,
    isPatient: isPatient && !requiresCredentials,
  }
}
