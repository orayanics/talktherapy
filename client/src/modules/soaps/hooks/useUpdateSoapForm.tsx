import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { UpdateSoapSchema } from '../types/schema'
import type { TUpdateSoapSchema } from '../types/schema'

import { mutateUpdateSoap, fetchSoapById } from '#/modules/soaps/api/soaps'
import { errMsg } from '#/lib/errorMessage'

export default function useUpdateSoapForm({ soapId }: { soapId: string }) {
  const { data: soap, isPending, refetch } = useQuery({
    ...fetchSoapById(soapId),
    enabled: !!soapId,
  })
  const [isConflict, setIsConflict] = useState(false)

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

  const updateMutation = mutateUpdateSoap(soapId, soap?.patientId ?? '')

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)
    setIsConflict(false)
    try {
      if (!soap) return
      await updateMutation.mutateAsync({ ...data, version: soap.version })
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setIsConflict(true)
      }
      setApiError(errMsg(error, 'Update SOAP failed'))
    }
  })

  const reloadLatest = async () => {
    const { data: refreshed } = await refetch()
    if (refreshed) {
      reset({
        activity_plan: refreshed.activity_plan ?? '',
        session_type: refreshed.session_type ?? '',
        subjective_notes: refreshed.subjective_notes ?? '',
        objective_notes: refreshed.objective_notes ?? '',
        assessment: refreshed.assessment ?? '',
        recommendation: refreshed.recommendation ?? '',
        comments: refreshed.comments ?? '',
      })
      setApiError(null)
      setIsConflict(false)
    }
  }

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
    isConflict,
    reloadLatest,
    isLoading: updateMutation.isPending || isSubmitting || isPending,
    control,
    watch,
    reset,
    isLoadingSoap: isPending,
  }
}
