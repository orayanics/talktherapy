import { useState } from 'react'
import { isAxiosError } from 'axios'
import { useNavigate } from '@tanstack/react-router'
import type React from 'react'

import type { ContentFormState, RawContent } from '~/models/content'
import type { ParsedError } from '~/models/system'
import { useUpdateContentId } from '~/api/content'
import { parseError } from '~/utils/errors'

function mapToFormState(content: RawContent): ContentFormState {
  return {
    title: content.title,
    description: content.description,
    bodyValue: content.body,
    diagnosisId: content.diagnosis_id,
    tags: content.tags.map((t) => t.tag.name).join(', '),
  }
}

export default function useUpdateContent({
  content,
  id,
}: {
  content: RawContent
  id: string
}) {
  const navigate = useNavigate()
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const [form, setForm] = useState<ContentFormState>(() =>
    mapToFormState(content),
  )

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

  const updateContentMutation = useUpdateContentId(id)

  async function handleSave() {
    setErrors(null)
    try {
      await updateContentMutation.mutateAsync({
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
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        setErrors(parseError(error.response.data))
      } else {
        setErrors(null)
      }
    }
  }

  function handleCancel() {
    navigate({ to: '/content/$contentId', params: { contentId: id } })
  }

  return {
    form,
    errors,
    handleChange,
    handleBodyChange,
    handleSave,
    handleCancel,
    isPending: updateContentMutation.isPending,
  }
}
