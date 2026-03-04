import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/models/system'
import type { CreateSoapPayload } from '~/models/schedule'
import { useCreateSoap } from '~/api/clinician'
import { parseError } from '~/utils/errors'

const DEFAULT_FORM: CreateSoapPayload = {
  activity_plan: '',
  session_type: '',
  subjective_notes: '',
  objective_notes: '',
  assessment: '',
  recommendation: '',
  comments: '',
}

export default function useAddSoap(patientId: string) {
  const [form, setForm] = useState<CreateSoapPayload>(DEFAULT_FORM)
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const mutation = useCreateSoap(patientId)

  function setField<TKey extends keyof CreateSoapPayload>(
    key: TKey,
    value: CreateSoapPayload[TKey],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setForm(DEFAULT_FORM)
    setErrors(null)
  }

  async function handleSubmit() {
    setErrors(null)
    try {
      await mutation.mutateAsync(form)
      reset()
      return true
    } catch (error: unknown) {
      setErrors(
        isAxiosError(error) ? parseError(error.response?.data ?? null) : null,
      )
      return false
    }
  }

  return {
    form,
    setField,
    errors,
    isLoading: mutation.isPending,
    handleSubmit,
    reset,
  }
}
