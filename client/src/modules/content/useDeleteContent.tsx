import { useState } from 'react'
import { isAxiosError } from 'axios'

import { mutateDeleteContent } from '@/api/content'

export default function useDeleteContent({ contentId }: { contentId: string }) {
  const [apiError, setApiError] = useState<string | null>(null)

  const deleteContentMutation = mutateDeleteContent(contentId)

  const onSubmit = async () => {
    try {
      await deleteContentMutation.mutateAsync()
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message = error.response?.data.message || 'Update content failed'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
    }
  }

  return {
    apiError,
    isLoading: deleteContentMutation.isPending,
    handleSubmit: onSubmit,
  }
}
