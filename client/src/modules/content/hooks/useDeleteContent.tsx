import { useState } from 'react'

import { useDeleteContent as useDeleteContentMutation } from './useContentMutations'
import { errMsg } from '#/lib/errorMessage'

export default function useDeleteContent({ contentId }: { contentId: string }) {
  const [apiError, setApiError] = useState<string | null>(null)

  const deleteContentMutation = useDeleteContentMutation(contentId)

  const onSubmit = async () => {
    try {
      await deleteContentMutation.mutateAsync()
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Delete content failed'))
    }
  }

  return {
    apiError,
    isLoading: deleteContentMutation.isPending,
    handleSubmit: onSubmit,
  }
}
