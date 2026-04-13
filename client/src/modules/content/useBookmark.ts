import { useState } from 'react'
import { isAxiosError } from 'axios'

import { mutateBookmarkContent, mutateRemoveBookmark } from '@/api/content'

export default function useBookmark(
  contentId: string,
  initialBookmarked = false,
) {
  const [apiError, setApiError] = useState<string | null>(null)

  const addMutation = mutateBookmarkContent(contentId)
  const removeMutation = mutateRemoveBookmark(contentId)

  const isLoading = addMutation.isPending || removeMutation.isPending

  const add = async () => {
    setApiError(null)

    try {
      await addMutation.mutateAsync()
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Failed to add bookmark'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
    }
  }

  const remove = async () => {
    setApiError(null)

    try {
      await removeMutation.mutateAsync()
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Failed to remove bookmark'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
    }
  }

  const toggle = async (bookmarked?: boolean) => {
    const isBookmarked =
      typeof bookmarked === 'boolean' ? bookmarked : initialBookmarked
    if (isBookmarked) {
      await remove()
    } else {
      await add()
    }
  }

  return { add, remove, toggle, apiError, isLoading }
}
