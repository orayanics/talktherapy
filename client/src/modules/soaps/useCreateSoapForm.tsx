import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'

import { CreateSoapSchema } from './schema'
import type { TCreateSoapSchema } from './schema'

import { mutateCreateSoap } from '@/api/records'

export default function useCreateSoapForm({
  patientId,
}: {
  patientId: string
}) {
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
  } = useForm<TCreateSoapSchema>({
    resolver: zodResolver(CreateSoapSchema),
    defaultValues: {
      activity_plan: '',
      session_type: '',
      subjective_notes: '',
      objective_notes: '',
      assessment: '',
      recommendation: '',
      comments: '',
    },
  })

  const createMutation = mutateCreateSoap(patientId)

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)
    try {
      await createMutation.mutateAsync(data)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message = error.response?.data.message || 'Create SOAP failed'
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
