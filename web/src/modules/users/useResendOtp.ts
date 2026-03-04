import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/models/system'
import { parseError } from '~/utils/errors'
import { useResendAccOtp } from '~/api/auth'

export default function useResendOtp({ id }: { id: string }) {
  const [errors, setErrors] = useState<ParsedError | null>(null)

  const resendOtpMutation = useResendAccOtp()

  async function handleSubmit() {
    setErrors(null)
    try {
      await resendOtpMutation.mutateAsync({ id: id })
      return true
    } catch (error: unknown) {
      setErrors(
        isAxiosError(error) ? parseError(error.response?.data ?? null) : null,
      )
      return false
    }
  }

  return {
    errors,
    isLoading: resendOtpMutation.isPending,
    handleSubmit,
  }
}
