import { useState } from 'react'

import { mutateDeleteContent } from '#/modules/content/api/content'
import { errMsg } from '#/lib/errorMessage'

export default function useDeleteContent({ contentId }: { contentId: string }) {
  const [apiError, setApiError] = useState<string | null>(null)

  const deleteContentMutation = mutateDeleteContent(contentId)

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
