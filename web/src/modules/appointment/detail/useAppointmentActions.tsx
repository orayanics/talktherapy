import { useState } from 'react'
import { isAxiosError } from 'axios'

import type { ParsedError } from '~/models/system'
import {
  useCancelAppointmentById,
  useCompleteAppointmentById,
  useConfirmAppointmentById,
} from '~/api/appointments'
import { parseError } from '~/utils/errors'

export default function useAppointmentActions(appointmentId: string) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [keepBlocked, setKeepBlocked] = useState(true)
  const [confirmErrors, setConfirmErrors] = useState<ParsedError | null>(null)
  const [completeErrors, setCompleteErrors] = useState<ParsedError | null>(null)
  const [cancelErrors, setCancelErrors] = useState<ParsedError | null>(null)

  const confirmMutation = useConfirmAppointmentById(appointmentId)
  const completeMutation = useCompleteAppointmentById(appointmentId)
  const cancelMutation = useCancelAppointmentById(appointmentId)

  function openConfirm() {
    setConfirmErrors(null)
    setConfirmOpen(true)
  }

  function closeConfirm() {
    setConfirmOpen(false)
    setConfirmErrors(null)
  }

  function openComplete() {
    setCompleteErrors(null)
    setCompleteOpen(true)
  }

  function closeComplete() {
    setCompleteOpen(false)
    setCompleteErrors(null)
  }

  function openCancel() {
    setCancelErrors(null)
    setCancelReason('')
    setKeepBlocked(true)
    setCancelOpen(true)
  }

  function closeCancel() {
    setCancelOpen(false)
    setCancelErrors(null)
    setCancelReason('')
    setKeepBlocked(true)
  }

  async function handleConfirm() {
    setConfirmErrors(null)
    try {
      await confirmMutation.mutateAsync()
      setConfirmOpen(false)
      return true
    } catch (error: unknown) {
      setConfirmErrors(
        isAxiosError(error) ? parseError(error.response?.data ?? null) : null,
      )
      return false
    }
  }

  async function handleComplete() {
    setCompleteErrors(null)
    try {
      await completeMutation.mutateAsync()
      setCompleteOpen(false)
      return true
    } catch (error: unknown) {
      setCompleteErrors(
        isAxiosError(error) ? parseError(error.response?.data ?? null) : null,
      )
      return false
    }
  }

  async function handleCancel() {
    setCancelErrors(null)
    try {
      await cancelMutation.mutateAsync({
        reason: cancelReason || undefined,
        keep_blocked: keepBlocked,
      })
      setCancelOpen(false)
      setCancelReason('')
      setKeepBlocked(true)
      return true
    } catch (error: unknown) {
      setCancelErrors(
        isAxiosError(error) ? parseError(error.response?.data ?? null) : null,
      )
      return false
    }
  }

  return {
    confirmOpen,
    completeOpen,
    cancelOpen,
    cancelReason,
    keepBlocked,
    setKeepBlocked,
    confirmErrors,
    completeErrors,
    cancelErrors,
    isConfirming: confirmMutation.isPending,
    isCompleting: completeMutation.isPending,
    isCancelling: cancelMutation.isPending,
    openConfirm,
    closeConfirm,
    openComplete,
    closeComplete,
    openCancel,
    closeCancel,
    handleConfirm,
    handleComplete,
    handleCancel,
    setCancelReason,
  }
}
