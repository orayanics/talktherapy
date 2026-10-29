import { useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { assessPronunciation } from '../api/slp'
import type { AssessResponse } from '../api/slp'

export default function useSlpAssessment() {
  const [result, setResult] = useState<AssessResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)
  const active = useRef<AbortController | null>(null)
  useEffect(
    () => () => {
      active.current?.abort()
      active.current = null
    },
    [],
  )

  const resetAssessment = () => {
    active.current?.abort()
    active.current = null
    setSubmitting(false)
    setApiError(null)
    setResult(null)
  }
  const submitAssessment = async (
    audio: Blob,
    reference: string,
    language: 'en' | 'tl' = 'en',
  ) => {
    if (active.current) return
    const controller = new AbortController()
    active.current = controller
    setSubmitting(true)
    setApiError(null)
    setResult(null)
    try {
      const data = await assessPronunciation(
        audio,
        reference,
        controller.signal,
        language,
      )
      if (active.current === controller) setResult(data)
    } catch (error) {
      if (active.current !== controller || controller.signal.aborted) return
      let message =
        'We could not send that recording. Check your connection and try again.'
      if (isAxiosError(error)) {
        const status = error.response?.status
        if (status === 413)
          message = 'That recording was too long. Try a shorter turn.'
        else if (status === 422)
          message =
            'That was hard to hear. Try a new recording somewhere quieter.'
        else if (status === 429 || status === 503)
          message =
            'Practice analysis is busy. You can replay your recording or try again later.'
        else if (
          status === 504 ||
          error.code === 'ECONNABORTED' ||
          error.code === 'ETIMEDOUT'
        )
          message = 'That took too long. Your recording is ready to send again.'
        else if (status === 502)
          message = 'The practice result was unavailable. Try again later.'
      }
      setApiError(message)
    } finally {
      if (active.current === controller) {
        active.current = null
        setSubmitting(false)
      }
    }
  }
  return { result, apiError, isSubmitting, submitAssessment, resetAssessment }
}
