import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/models/system'
import { parseError } from '~/utils/errors'
import { useDeactivateAccount } from '~/api/auth'

export default function useDeactivateUser({ id }: { id: string }) {
  const [errors, setErrors] = useState<ParsedError | null>(null)

  const deactivateAccountMutation = useDeactivateAccount()

  async function handleSubmit() {
    setErrors(null)
    try {
      await deactivateAccountMutation.mutateAsync({ id: id })
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
    isLoading: deactivateAccountMutation.isPending,
    handleSubmit,
  }
}
