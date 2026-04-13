import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'

import { ContentSchema } from './schema'
import type { TContentSchema } from './schema'

import { mutateCreateContent } from '@/api/content'

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
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message = error.response?.data.message || 'Create content failed'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
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
