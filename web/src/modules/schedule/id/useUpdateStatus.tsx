import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/models/system'
import { useUpdateScheduleStatus } from '~/api/scheduling'
import { parseError } from '~/utils/errors'

export default function useUpdateStatus({ ruleId }: { ruleId: string }) {
  const [errors, setErrors] = useState<ParsedError | null>(null)

  const updateMutation = useUpdateScheduleStatus(ruleId)

  async function handleSubmit() {
    setErrors(null)
    try {
      await updateMutation.mutateAsync()
    } catch (err) {
      if (isAxiosError(err)) {
        const parsed = parseError(
          err.response?.data || 'An error occurred while updating status.',
        )
        setErrors(parsed)
      }
    }
  }

  return { handleSubmit, errors, isLoading: updateMutation.isPending }
}
