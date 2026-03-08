import { useState } from 'react'
import { isAxiosError } from 'axios'
import { useNavigate } from '@tanstack/react-router'
import type React from 'react'

import type { ContentFormState } from '~/models/content'
import type { ParsedError } from '~/models/system'
import { useCreateContent } from '~/api/content'
import { parseError } from '~/utils/errors'

const DEFAULT_FORM: ContentFormState = {
  title: '',
  description: '',
  bodyValue: '',
  diagnosisId: '',
  tags: '',
}

export default function useAddContent() {
  const navigate = useNavigate()
  const [form, setForm] = useState<ContentFormState>(DEFAULT_FORM)
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const createContent = useCreateContent()

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setErrors(null)
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleBodyChange = (value: string | undefined) => {
    setErrors(null)
    setForm((prev) => ({ ...prev, bodyValue: value ?? '' }))
  }

  async function handleSubmit() {
    setErrors(null)
    try {
      await createContent.mutateAsync({
        title: form.title,
        description: form.description,
        body: form.bodyValue,
        diagnosis_id: form.diagnosisId,
        tag_names: form.tags
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      })
      navigate({ to: '/content' })
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        setErrors(parseError(error.response.data))
      }
    }
  }

  return {
    form,
    errors,
    handleChange,
    handleBodyChange,
    handleSubmit,
    isPending: createContent.isPending,
  }
}
