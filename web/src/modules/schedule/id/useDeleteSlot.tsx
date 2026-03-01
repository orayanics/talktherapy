import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/utils/errors'
import { useDeleteSlotId } from '~/api/scheduling'
import { parseError } from '~/utils/errors'

export default function useDeleteSlot({
  slotId,
  ruleId,
}: {
  slotId: string
  ruleId: string
}) {
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const deleteSlotMutation = useDeleteSlotId(slotId, ruleId)

  async function handleDelete() {
    setErrors(null)
    try {
      await deleteSlotMutation.mutateAsync()
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
    isLoading: deleteSlotMutation.isPending,
    handleSubmit: handleDelete,
  }
}
