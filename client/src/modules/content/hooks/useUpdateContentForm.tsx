import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

import { UpdateContentSchema } from '../types/schema'
import type { TUpdateContentInput, TUpdateContentSchema } from '../types/schema'

import { fetchContentById } from '#/modules/content/api/content'
import { useUpdateContent } from './useContentMutations'
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

  const initializedId = useRef<string | null>(null)
  const currentId = useRef(contentId)
  currentId.current = contentId
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
    reset,
  } = useForm<TUpdateContentInput, unknown, TUpdateContentSchema>({
    resolver: zodResolver(UpdateContentSchema),
    defaultValues: {
      title: '',
      description: '',
      body: '',
      diagnosis_id: '',
      tag_names: [],
    },
  })

  const updateMutation = useUpdateContent(contentId)

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)
    try {
      if (
        currentId.current !== contentId ||
        initializedId.current !== contentId ||
        content?.id !== contentId
      )
        return
      await updateMutation.mutateAsync(data)
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Update content failed'))
    }
  })

  useEffect(() => {
    if (initializedId.current !== contentId) {
      reset({
        title: '',
        description: '',
        body: '',
        diagnosis_id: '',
        tag_names: [],
      })
      setApiError(null)
    }
    if (content?.id !== contentId || initializedId.current === contentId) return
    initializedId.current = contentId

    reset({
      title: content.title,
      description: content.description,
      body: content.body,
      diagnosis_id: content.diagnosis?.id ?? '',
      tag_names: content.tags.map((tag) => tag.name),
    })
  }, [content, contentId, reset])

  return {
    register,
    onSubmit,
    errors,
    apiError,
    isLoading:
      updateMutation.isPending ||
      isSubmitting ||
      isPending ||
      content?.id !== contentId ||
      initializedId.current !== contentId,
    control,
    watch,
    reset,
    isLoadingContent: isPending,
  }
}
