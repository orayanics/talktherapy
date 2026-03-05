import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/models/system'
import { useAddBookmark, useRemoveBookmark } from '~/api/content'
import { parseError } from '~/utils/errors'

interface UseBookmarkOptions {
  contentId: string
  initialIsBookmarked?: boolean
}

export default function useBookmark({
  contentId,
  initialIsBookmarked = false,
}: UseBookmarkOptions) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [error, setError] = useState<ParsedError | null>(null)

  const addMutation = useAddBookmark(contentId)
  const removeMutation = useRemoveBookmark(contentId)

  const isLoading = addMutation.isPending || removeMutation.isPending

  async function toggle() {
    setError(null)
    try {
      if (isBookmarked) {
        await removeMutation.mutateAsync()
        setIsBookmarked(false)
      } else {
        await addMutation.mutateAsync()
        setIsBookmarked(true)
      }
    } catch (err: unknown) {
      setError(
        isAxiosError(err) ? parseError(err.response?.data ?? null) : null,
      )
    }
  }

  return {
    isBookmarked,
    isLoading,
    error,
    toggle,
  }
}
