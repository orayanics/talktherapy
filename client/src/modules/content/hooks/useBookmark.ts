import { useState } from 'react'

import { useBookmarkContent, useRemoveBookmark } from './useContentMutations'
import { errMsg } from '#/lib/errorMessage'

export default function useBookmark(
  contentId: string,
  initialBookmarked = false,
) {
  const [apiError, setApiError] = useState<string | null>(null)

  const addMutation = useBookmarkContent(contentId)
  const removeMutation = useRemoveBookmark(contentId)

  const isLoading = addMutation.isPending || removeMutation.isPending

  const add = async () => {
    setApiError(null)

    try {
      await addMutation.mutateAsync()
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Failed to add bookmark'))
    }
  }

  const remove = async () => {
    setApiError(null)

    try {
      await removeMutation.mutateAsync()
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Failed to remove bookmark'))
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
