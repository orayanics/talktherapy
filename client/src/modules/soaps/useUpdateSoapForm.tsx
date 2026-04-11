import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import { UpdateSoapSchema } from './schema'
import type { TUpdateSoapSchema } from './schema'

import { mutateUpdateSoap, fetchSoapById } from '@/api/records'

export default function useUpdateSoapForm({ soapId }: { soapId: string }) {
  const { data: soap, isPending } = useQuery({
    ...fetchSoapById(soapId),
    enabled: !!soapId,
  })

  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
    reset,
  } = useForm<TUpdateSoapSchema>({
    resolver: zodResolver(UpdateSoapSchema),
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

  const updateMutation = mutateUpdateSoap(soapId, soap?.patient_id ?? '')

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)
    try {
      await updateMutation.mutateAsync(data)
    } catch (error: any) {
      if (isAxiosError(error)) {
        const message = error.response?.data.message || 'Update SOAP failed'
        setApiError(message)
      } else {
        setApiError(error.message)
      }
    }
  })

  useEffect(() => {
    if (!soap) return

    reset({
      activity_plan: soap.activity_plan ?? '',
      session_type: soap.session_type ?? '',
      subjective_notes: soap.subjective_notes ?? '',
      objective_notes: soap.objective_notes ?? '',
      assessment: soap.assessment ?? '',
      recommendation: soap.recommendation ?? '',
      comments: soap.comments ?? '',
    })
  }, [soap, reset])

  return {
    register,
    onSubmit,
    errors,
    apiError,
    isLoading: updateMutation.isPending || isSubmitting,
    control,
    watch,
    reset,
    isLoadingSoap: isPending,
  }
}
