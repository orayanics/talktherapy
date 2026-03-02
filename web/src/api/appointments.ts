import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import type {
  BookAppointmentPayload,
  MyAppointmentsParams,
} from '~/models/schedule'
import { api } from '~/api/axios'
import { APPOINTMENT } from '~/config/message'
import { useAlert } from '~/context/AlertContext'
// ── Patient: book a slot ─────────────────────────────────────────────────────

export const useBookAppointmentSlot = (slotId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: BookAppointmentPayload) => {
      const { data } = await api.post(
        `/scheduling/slots/${slotId}/book`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      showAlert(APPOINTMENT.book.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to book appointment:', error.response?.data)
      }
      showAlert(APPOINTMENT.book.error, 'error')
    },
  })
}

// ── Patient: my appointments ─────────────────────────────────────────────

export const patientMyAppointmentsQuery = (params: MyAppointmentsParams) =>
  queryOptions({
    queryKey: ['patient', 'my-appointments', params],
    queryFn: async () => {
      const { data } = await api.get('/scheduling/appointments/my', {
        params: {
          ...(params.status && { status: params.status }),
          page: params.page ?? 1,
          per_page: params.perPage ?? 10,
        },
      })
      return data
    },
    placeholderData: (prev) => prev,
    retry: false,
  })

// ── Clinician: slot appointment query ────────────────────────────────────────

export const clinicianSlotAppointmentQuery = (slotId: string) =>
  queryOptions({
    queryKey: ['clinician', 'slot', slotId, 'appointment'],
    queryFn: async () => {
      const { data } = await api.get(`/scheduling/slots/${slotId}/appointment`)
      return data
    },
    retry: false,
  })

// ── Clinician: confirm / cancel ───────────────────────────────────────────────

export const useCompleteAppointmentById = (appointmentId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(
        `/scheduling/appointments/${appointmentId}/complete`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinician', 'slot'] })
      showAlert(APPOINTMENT.complete.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to complete appointment:', error.response?.data)
      }
      showAlert(APPOINTMENT.complete.error, 'error')
    },
  })
}

export const useConfirmAppointmentById = (appointmentId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(
        `/scheduling/appointments/${appointmentId}/confirm`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinician', 'slot'] })
      showAlert(APPOINTMENT.confirm.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to confirm appointment:', error.response?.data)
      }
      showAlert(APPOINTMENT.confirm.error, 'error')
    },
  })
}

export const useCancelAppointmentById = (appointmentId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: {
      reason?: string
      keep_blocked?: boolean
    }) => {
      const { data } = await api.patch(
        `/scheduling/appointments/${appointmentId}/cancel`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinician', 'slot'] })
      showAlert(APPOINTMENT.cancel.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to cancel appointment:', error.response?.data)
      }
      showAlert(APPOINTMENT.cancel.error, 'error')
    },
  })
}

// ── Clinician: unblock a slot ─────────────────────────────────────────────────

export const useUnblockSlot = (slotId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/scheduling/slots/${slotId}/unblock`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinician', 'slot', slotId] })
      showAlert(APPOINTMENT.unblock.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to unblock slot:', error.response?.data)
      }
      showAlert(APPOINTMENT.unblock.error, 'error')
    },
  })
}
// ── Patient: detail query ─────────────────────────────────────────────────────

export const patientMyAppointmentDetailQuery = (appointmentId: string) =>
  queryOptions({
    queryKey: ['patient', 'my-appointments', appointmentId],
    queryFn: async () => {
      const { data } = await api.get(
        `/scheduling/appointments/my/${appointmentId}`,
      )
      return data
    },
    retry: false,
  })

// ── Patient: cancel own appointment ──────────────────────────────────────────

export const usePatientCancelAppointment = (appointmentId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: { reason?: string }) => {
      const { data } = await api.patch(
        `/scheduling/appointments/my/${appointmentId}/cancel`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient', 'my-appointments'],
      })
      showAlert(APPOINTMENT.cancel.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to cancel appointment:', error.response?.data)
      }
      showAlert(APPOINTMENT.cancel.error, 'error')
    },
  })
}

// ── Patient: reschedule own appointment ──────────────────────────────────────

export const usePatientRescheduleAppointment = (appointmentId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: { new_slot_id: string }) => {
      const { data } = await api.patch(
        `/scheduling/appointments/my/${appointmentId}/reschedule`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient', 'my-appointments'],
      })
      showAlert(APPOINTMENT.reschedule.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to reschedule appointment:', error.response?.data)
      }
      showAlert(APPOINTMENT.reschedule.error, 'error')
    },
  })
}
