import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/models/system'
import { parseError } from '~/utils/errors'
import { useReactivateAccount } from '~/api/auth'

export default function useReactiveUser({ id }: { id: string }) {
  const [errors, setErrors] = useState<ParsedError | null>(null)

  const reactivateAccountMutation = useReactivateAccount()

  async function handleSubmit() {
    setErrors(null)
    try {
      await reactivateAccountMutation.mutateAsync({ id: id })
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
    isLoading: reactivateAccountMutation.isPending,
    handleSubmit,
  }
}
