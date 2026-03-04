import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/models/system'
import { parseError } from '~/utils/errors'
import { useSuspendAccount } from '~/api/auth'

export default function useSuspendUser({ id }: { id: string }) {
  const [errors, setErrors] = useState<ParsedError | null>(null)

  const suspendAccountMutation = useSuspendAccount()

  async function handleSubmit() {
    setErrors(null)
    try {
      await suspendAccountMutation.mutateAsync({ id: id })
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
    isLoading: suspendAccountMutation.isPending,
    handleSubmit,
  }
}
