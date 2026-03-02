import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/utils/errors'
import {
  usePatientCancelAppointment,
  usePatientRescheduleAppointment,
} from '~/api/appointments'
import { parseError } from '~/utils/errors'

export default function useMyAppointmentActions(appointmentId: string) {
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelErrors, setCancelErrors] = useState<ParsedError | null>(null)

  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleErrors, setRescheduleErrors] = useState<ParsedError | null>(
    null,
  )

  const cancelMutation = usePatientCancelAppointment(appointmentId)
  const rescheduleMutation = usePatientRescheduleAppointment(appointmentId)

  // ── Cancel ────────────────────────────────────────────────────────────────

  function openCancel() {
    setCancelErrors(null)
    setCancelReason('')
    setCancelOpen(true)
  }

  function closeCancel() {
    setCancelOpen(false)
    setCancelErrors(null)
    setCancelReason('')
  }

  async function handleCancel() {
    setCancelErrors(null)
    try {
      await cancelMutation.mutateAsync({
        reason: cancelReason || undefined,
      })
      setCancelOpen(false)
      setCancelReason('')
      return true
    } catch (error: unknown) {
      setCancelErrors(
        isAxiosError(error) ? parseError(error.response?.data ?? null) : null,
      )
      return false
    }
  }

  // ── Reschedule ────────────────────────────────────────────────────────────

  function openReschedule() {
    setRescheduleErrors(null)
    setRescheduleOpen(true)
  }

  function closeReschedule() {
    setRescheduleOpen(false)
    setRescheduleErrors(null)
  }

  async function handleReschedule(newSlotId: string) {
    setRescheduleErrors(null)
    try {
      await rescheduleMutation.mutateAsync({ new_slot_id: newSlotId })
      setRescheduleOpen(false)
      return true
    } catch (error: unknown) {
      setRescheduleErrors(
        isAxiosError(error) ? parseError(error.response?.data ?? null) : null,
      )
      return false
    }
  }

  return {
    // cancel
    cancelOpen,
    cancelReason,
    cancelErrors,
    isCancelling: cancelMutation.isPending,
    openCancel,
    closeCancel,
    handleCancel,
    setCancelReason,
    // reschedule
    rescheduleOpen,
    rescheduleErrors,
    isRescheduling: rescheduleMutation.isPending,
    openReschedule,
    closeReschedule,
    handleReschedule,
  }
}
