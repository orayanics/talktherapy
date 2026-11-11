import { retryApiQuery } from '#/lib/api/query'
import { queryOptions } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import type { QueryParams } from '#/types/api'
import type { ScheduleParams } from '#/modules/schedules/types/params'
import type {
  Appointment,
  AppointmentsResponse,
} from '#/modules/appointments/types/appointment'

export const fetchAppointments = (
  params: QueryParams = {},
  searchParams: ScheduleParams = {},
) => {
  const query = {
    page: params.page,
    per_page: params.per_page,
    date_from: searchParams.from,
    date_to: searchParams.to,
    sort: searchParams.sort,
    status: searchParams.status,
  }
  return queryOptions<AppointmentsResponse>({
    queryKey: ['appointments', query],
    retry: retryApiQuery,
    queryFn: async ({ signal }) =>
      api<AppointmentsResponse>('/api/v1/appointments', {
        method: 'GET',
        signal,
        params: query,
      }),
  })
}
export const fetchAppointment = (appointmentId: string) =>
  queryOptions<{ data: Appointment }>({
    queryKey: ['appointment', appointmentId],
    retry: retryApiQuery,
    queryFn: async ({ signal }) =>
      api(`/api/v1/appointments/${appointmentId}`, { method: 'GET', signal }),
  })
export const mutateAppointmentAction = async (
  action: 'accept' | 'reject' | 'cancel' | 'complete',
  payload: string | { id: string; body?: Record<string, unknown> },
) => {
  const appointmentId = typeof payload === 'string' ? payload : payload.id
  const body = typeof payload === 'string' ? undefined : payload.body
  return (
    await api<{ data: Appointment }>(
      `/api/v1/appointments/${appointmentId}/${action}`,
      {
        method: 'POST',
        data: body ? JSON.stringify(body) : undefined,
      },
    )
  ).data
}
