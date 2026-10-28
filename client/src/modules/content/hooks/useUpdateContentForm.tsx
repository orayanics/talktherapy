import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import { UpdateContentSchema } from '../types/schema'
import type { TUpdateContentSchema } from '../types/schema'

import {
  mutateUpdateContent,
  fetchContentById,
} from '#/modules/content/api/content'
import { errMsg } from '#/lib/errorMessage'

export default function useUpdateContentForm({
  contentId,
}: {
  contentId: string
}) {
  const { data: content, isPending } = useQuery({
    ...fetchContentById(contentId),
    enabled: !!contentId,
  })

  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
    reset,
  } = useForm<TUpdateContentSchema>({
    resolver: zodResolver(UpdateContentSchema),
    defaultValues: {
      title: '',
      description: '',
      body: '',
      diagnosis_id: '',
      tag_names: [],
    },
  })

  const updateMutation = mutateUpdateContent(contentId)

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)
    try {
      await updateMutation.mutateAsync(data)
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Update content failed'))
    }
  })

  useEffect(() => {
    if (!content) return

    reset({
      title: content.title,
      description: content.description,
      body: content.body,
      diagnosis_id:
        (content as any).diagnosis_id ?? (content as any).diagnosisId ?? '',
      tag_names: content.tags.map((t) => {
        const tag = (t as any).tag ?? (t as any)
        return tag.name
      }),
    })
  }, [content, reset])

  return {
    register,
    onSubmit,
    errors,
    apiError,
    isLoading: updateMutation.isPending || isSubmitting,
    control,
    watch,
    reset,
    isLoadingContent: isPending,
  }
}
