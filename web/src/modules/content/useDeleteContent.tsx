import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/utils/errors'
import { useDeleteContentId } from '~/api/content'
import { parseError } from '~/utils/errors'

export default function useDeleteContent({ contentId }: { contentId: string }) {
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const deleteContentMutation = useDeleteContentId(contentId)

  async function handleDelete() {
    setErrors(null)
    try {
      await deleteContentMutation.mutateAsync()
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
    isLoading: deleteContentMutation.isPending,
    handleSubmit: handleDelete,
  }
}
