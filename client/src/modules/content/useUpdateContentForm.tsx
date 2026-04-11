import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import { UpdateContentSchema } from './schema'
import type { TUpdateContentSchema } from './schema'

import { mutateUpdateContent, fetchContentById } from '@/api/content'

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
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message = error.response?.data.message || 'Update content failed'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
    }
  })

  useEffect(() => {
    if (!content) return

    reset({
      title: content.title,
      description: content.description,
      body: content.body,
      diagnosis_id: content.diagnosis_id,
      tag_names: content.tags.map((t) => t.tag.name),
      //   tag_names: content.tags.map((t) => t.tag.name).join(', '),
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
