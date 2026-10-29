import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import { useAlert } from '#/context/AlertContext'
import type { QueryParams } from '#/types/api'
import type { ScheduleParams } from '#/modules/schedules/types/params'
import type {
  Appointment,
  AppointmentsResponse,
} from '#/modules/appointments/types/appointment'
import { APPOINTMENT as APPT_MSG } from '#/constants/message'

export const fetchAppointments = (
  params: QueryParams = {},
  searchParams: ScheduleParams = {},
) => {
  const query = {
    page: params.page,
    date_from: searchParams.from,
    date_to: searchParams.to,
    sort: searchParams.sort,
  }
  return queryOptions<AppointmentsResponse>({
    queryKey: ['appointments', query],
    queryFn: async () =>
      api<AppointmentsResponse>('/api/v1/appointments', {
        method: 'GET',
        params: query,
      }),
  })
}
export const fetchAppointment = (appointmentId: string) =>
  queryOptions<{ data: Appointment }>({
    queryKey: ['appointment', appointmentId],
    queryFn: async () =>
      api(`/api/v1/appointments/${appointmentId}`, { method: 'GET' }),
  })
const appointmentAction = (
  action: 'accept' | 'reject' | 'cancel' | 'complete',
  successMsg: string,
) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (
      payload: string | { id: string; body?: Record<string, unknown> },
    ) => {
      const appointmentId = typeof payload === 'string' ? payload : payload.id
      const body = typeof payload === 'string' ? undefined : payload.body
      return (
        await api(`/api/v1/appointments/${appointmentId}/${action}`, {
          method: 'POST',
          data: body ? JSON.stringify(body) : undefined,
        })
      ).data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['appointment'] })
      if (action === 'complete')
        await queryClient.invalidateQueries({
          queryKey: ['clinician-patients'],
        })
      showAlert(successMsg, 'success')
    },
    onError: async (error: { response?: { status?: number } }) => {
      if (error.response?.status === 409) {
        await queryClient.invalidateQueries({ queryKey: ['appointments'] })
        await queryClient.invalidateQueries({ queryKey: ['appointment'] })
        await queryClient.invalidateQueries({ queryKey: ['slots'] })
      }
    },
  })
}
export const mutateAcceptAppointment = () =>
  appointmentAction('accept', APPT_MSG.confirm.success)
export const mutateRejectAppointment = () =>
  appointmentAction('reject', APPT_MSG.reschedule.error)
export const mutateCancelAppointment = () =>
  appointmentAction('cancel', APPT_MSG.cancel.success)
export const mutateCompleteAppointment = () =>
  appointmentAction('complete', APPT_MSG.complete.success)
