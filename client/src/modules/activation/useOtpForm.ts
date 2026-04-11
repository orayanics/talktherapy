import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { VerifyOtpSchema } from './schema'
import type { TVerifyOtp } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { mutateVerifyOtp } from '@/api/activate'
import { isAxiosError } from 'axios'
import { useNavigate } from '@tanstack/react-router'

export default function useOtpForm() {
  const [apiError, setApiError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<TVerifyOtp>({
    resolver: zodResolver(VerifyOtpSchema),
    defaultValues: {
      email: '',
      otp_code: '',
    },
  })

  const verifyOtpMutation = mutateVerifyOtp()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      // get role from response and navigate accordingly
      const result = await verifyOtpMutation.mutateAsync(data)
      const isClinician = result?.role === 'CLINICIAN'
      navigate({
        to: '/activate/otp/update',
        search: {
          otp: data.otp_code,
          ...(isClinician && { role: 'CLINICIAN' }),
        },
      })
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
    isLoading: verifyOtpMutation.isPending || isLoading,
  }
}
