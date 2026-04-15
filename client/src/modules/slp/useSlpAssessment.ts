import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { assessPronunciation, type AssessResponse } from '@/api/slp'

export default function useSlpAssessment() {
  const [result, setResult] = useState<AssessResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const assessMutation = useMutation({
    mutationFn: async ({
      audioBlob,
      referenceText,
    }: {
      audioBlob: Blob
      referenceText: string
    }) => assessPronunciation(audioBlob, referenceText),
    onSuccess: (data) => {
      setApiError(null)
      setResult(data)
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        const detail =
          typeof error.response?.data?.detail === 'string'
            ? error.response.data.detail
            : undefined
        setApiError(detail ?? error.message ?? 'Failed to submit assessment.')
        return
      }

      setApiError(
        error instanceof Error ? error.message : 'Failed to submit assessment.',
      )
    },
  })

  const submitAssessment = async (audioBlob: Blob, referenceText: string) => {
    await assessMutation.mutateAsync({ audioBlob, referenceText })
  }

  const resetAssessment = () => {
    setApiError(null)
    setResult(null)
  }

  return {
    result,
    apiError,
    submitAssessment,
    resetAssessment,
    isSubmitting: assessMutation.isPending,
  }
}
