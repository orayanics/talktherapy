import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { ContentSchema } from '../types/schema'
import type { TContentSchema } from '../types/schema'

import { mutateCreateContent } from '#/modules/content/api/content'
import { errMsg } from '#/lib/errorMessage'

export default function useContentForm() {
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
  } = useForm<TContentSchema>({
    resolver: zodResolver(ContentSchema),
    defaultValues: {
      body: '',
      description: '',
      diagnosis_id: '',
      tag_names: [],
      title: '',
    },
  })

  const createMutation = mutateCreateContent()

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)

    try {
      await createMutation.mutateAsync(data)
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Create content failed'))
    }
  })

  return {
    register,
    onSubmit,
    errors,
    apiError,
    isLoading: createMutation.isPending || isSubmitting,
    control,
    watch,
  }
}
