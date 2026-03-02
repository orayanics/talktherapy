import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/models/system'
import { useDeleteScheduleId } from '~/api/scheduling'
import { parseError } from '~/utils/errors'

export default function useDeleteSchedule({ ruleId }: { ruleId: string }) {
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const deleteScheduleMutation = useDeleteScheduleId(ruleId)

  async function handleDelete() {
    setErrors(null)
    try {
      await deleteScheduleMutation.mutateAsync()
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
    isLoading: deleteScheduleMutation.isPending,
    handleSubmit: handleDelete,
  }
}
