import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { CreateSoapSchema } from '../types/schema'
import type { TCreateSoapSchema } from '../types/schema'

import { mutateCreateSoap } from '#/modules/soaps/api/soaps'
import { errMsg } from '#/lib/errorMessage'

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
    } catch (error: unknown) {
      setApiError(errMsg(error, 'Create SOAP failed'))
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
