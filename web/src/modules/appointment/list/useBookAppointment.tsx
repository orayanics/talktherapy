import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { AvailableSlot, BookAppointmentPayload } from '~/models/schedule'
import type { ParsedError } from '~/models/system'
import { parseError } from '~/utils/errors'
import { useBookAppointmentSlot } from '~/api/appointments'

const EMPTY_FORM: BookAppointmentPayload = {
  medical_diagnosis: '',
  source_referral: '',
  chief_complaint: '',
  referral_url: '',
}

export default function useBookAppointment() {
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [errors, setErrors] = useState<ParsedError | null>(null)
  const [form, setForm] = useState<BookAppointmentPayload>(EMPTY_FORM)

  const bookMutation = useBookAppointmentSlot(selectedSlot?.id ?? '')

  function handleOpen(slot: AvailableSlot) {
    setErrors(null)
    setForm(EMPTY_FORM)
    setSelectedSlot(slot)
  }

  function handleCancel() {
    setSelectedSlot(null)
    setErrors(null)
    setForm(EMPTY_FORM)
  }

  function handleFormChange(
    field: keyof BookAppointmentPayload,
    value: string,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleConfirm() {
    if (!selectedSlot) return false
    setErrors(null)
    try {
      const payload: BookAppointmentPayload = {
        medical_diagnosis: form.medical_diagnosis || undefined,
        source_referral: form.source_referral || undefined,
        chief_complaint: form.chief_complaint || undefined,
        referral_url: form.referral_url || undefined,
      }
      await bookMutation.mutateAsync(payload)
      setSelectedSlot(null)
      setForm(EMPTY_FORM)
      return true
    } catch (error: unknown) {
      setErrors(
        isAxiosError(error) ? parseError(error.response?.data ?? null) : null,
      )
      return false
    }
  }

  return {
    selectedSlot,
    form,
    errors,
    isLoading: bookMutation.isPending,
    isModalOpen: selectedSlot !== null,
    handleOpen,
    handleCancel,
    handleConfirm,
    handleFormChange,
  }
}
