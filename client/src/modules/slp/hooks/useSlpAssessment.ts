import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { assessPronunciation } from '#/modules/slp/api/slp'
import type { AssessResponse } from '#/modules/slp/api/slp'

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
        const status = error.response?.status
        const responseData = error.response?.data as
          | { errors?: Record<string, string[]> }
          | undefined
        const fieldError = Object.values(responseData?.errors ?? {})
          .flat()
          .find((message) => typeof message === 'string')

        if (status === 413) {
          setApiError('The recording exceeds the 10 MiB upload limit.')
        } else if (status === 422) {
          setApiError(fieldError ?? 'The recording could not be assessed. Check the audio and reference text.')
        } else if (status === 429) {
          setApiError('Too many assessments were submitted. Please wait a minute and try again.')
        } else if (status === 503) {
          setApiError('The assessment service is busy or unavailable. Please try again later.')
        } else if (status === 504 || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          setApiError('The assessment took too long. Try again later with a shorter recording.')
        } else if (status === 502) {
          setApiError('The assessment service returned an unusable result. Please try again later.')
        } else {
          setApiError('Could not submit the assessment. Check your connection and try again.')
        }
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
