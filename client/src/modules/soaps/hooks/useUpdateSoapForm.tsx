import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { UpdateSoapSchema } from '../types/schema'
import type { TUpdateSoapSchema } from '../types/schema'

import { fetchSoapById } from '#/modules/soaps/api/soaps'
import { useUpdateSoap } from './useSoapsMutations'
import type { Soap } from '../types/soap'
import { errMsg } from '#/lib/errorMessage'

export default function useUpdateSoapForm({ soapId }: { soapId: string }) {
  const {
    data: soap,
    isPending,
    refetch,
  } = useQuery({
    ...fetchSoapById(soapId),
    enabled: !!soapId,
  })
  const baseline = useRef<Soap | null>(null)
  const currentId = useRef(soapId)
  currentId.current = soapId
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

  const updateMutation = useUpdateSoap(
    soapId,
    baseline.current?.id === soapId ? baseline.current.patientId : '',
  )

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null)
    setIsConflict(false)
    try {
      const original = baseline.current
      if (
        currentId.current !== soapId ||
        original?.id !== soapId ||
        soap?.id !== soapId
      )
        return
      await updateMutation.mutateAsync({ ...data, version: original.version })
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setIsConflict(true)
      }
      setApiError(errMsg(error, 'Update SOAP failed'))
    }
  })

  const reloadLatest = async () => {
    const { data: refreshed } = await refetch()
    if (refreshed?.id === soapId && currentId.current === soapId) {
      baseline.current = refreshed
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
    if (baseline.current?.id !== soapId) {
      reset({ activity_plan: '' })
      setApiError(null)
      setIsConflict(false)
    }
    if (soap?.id !== soapId || baseline.current?.id === soapId) return
    baseline.current = soap

    reset({
      activity_plan: soap.activity_plan ?? '',
      session_type: soap.session_type ?? '',
      subjective_notes: soap.subjective_notes ?? '',
      objective_notes: soap.objective_notes ?? '',
      assessment: soap.assessment ?? '',
      recommendation: soap.recommendation ?? '',
      comments: soap.comments ?? '',
    })
  }, [soap, soapId, reset])

  return {
    register,
    onSubmit,
    errors,
    apiError,
    isConflict,
    reloadLatest,
    isLoading:
      updateMutation.isPending ||
      isSubmitting ||
      isPending ||
      soap?.id !== soapId ||
      baseline.current?.id !== soapId,
    control,
    watch,
    reset,
    isLoadingSoap: isPending,
  }
}
