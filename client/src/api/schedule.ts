import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from './client'
import type { QueryParams, ScheduleParams, Meta } from '@/types/params'
import { useAlert } from '@/context/AlertContext'
import { useNavigate } from '@tanstack/react-router'
import type { TSchedule } from '@/modules/schedules/schema'
import { APPOINTMENT as APPT_MSG } from '@/constants/message'
import type { DiagnosisItem } from './public'

export type APPOINTMENT_STATUS =
  | 'FREE'
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECT'
  | 'CANCELLED'
  | 'COMPLETED'

export type SLOT_STATUS =
  | 'FREE'
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECT'
  | 'CANCELLED'
  | 'COMPLETED'

export interface Slot {
  id: string
  schedule_id: string
  clinician_id: string
  startAt: string
  endAt: string
  status: SLOT_STATUS
  isHidden: boolean
  user: {
    diagnosis: DiagnosisItem
  }
}

export interface SlotsResponse {
  data: Slot[]
  meta: Meta
}

export interface ScheduleResponse {
  data: TSchedule
}

export interface SchedulesResponse {
  data: TSchedule[]
  meta: Meta
}

export interface Patient {
  id: string
  name: string
  email: string
}

export interface Clinician {
  id: string
  name: string
  diagnosis: string
}

export interface Encounter {
  id: string
  appointment_id: string
  diagnosis: string
  chief_complaint: string
  referral_source: string
  referral_url: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  type: string
  actor_type: string
  actor_id: string
  reason: string | null
  created_at: string
}

export interface Appointment {
  id: string
  slot: Slot
  patient: Patient
  clinician: Clinician
  status: APPOINTMENT_STATUS
  booked_at: string
  confirmed_at: string | null
  cancelled_at: string | null
  completed_at: string | null
  events: Event[]
  encounter: Encounter[]
  room_id?: string | null
}

export interface AppointmentsResponse {
  data: Appointment[]
  meta: Meta
}

export const fetchSlots = (
  params: QueryParams = {},
  searchParams: ScheduleParams = {},
) => {
  const query = {
    page: params.page,
    date_from: searchParams.from,
    sort: searchParams.sort,
    diagnosis: searchParams.diagnosis,
  }

  return queryOptions<SlotsResponse>({
    queryKey: ['slots', query],
    queryFn: async () => {
      const { data } = await api(`/appointments/slots`, {
        method: 'GET',
        params: query,
      })
      return data
    },
    staleTime: 30 * 60 * 1000,
  })
}

export const fetchSlot = (slotId: string) => {
  return queryOptions<Slot>({
    queryKey: ['slot', slotId],
    queryFn: async () => {
      const { data } = await api(`/slots/${slotId}`, {
        method: 'GET',
      })
      return data
    },
    staleTime: 30 * 60 * 1000,
  })
}

export const mutateSchedule = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: TSchedule) => {
      const { data } = await api('/schedule', {
        method: 'POST',
        data: JSON.stringify(payload),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['schedules'] })
      await queryClient.invalidateQueries({ queryKey: ['slots'] })
      showAlert('Schedule created successfully', 'success')
      navigate({ to: '/schedules' })
    },
  })
}

export const fetchSchedules = (
  params: QueryParams = {},
  searchParams: ScheduleParams = {},
) => {
  const query = {
    page: params.page,
    date_from: searchParams.from,
    date_to: searchParams.to,
    sort: searchParams.sort,
  }

  return queryOptions<SchedulesResponse>({
    queryKey: ['schedules', query],
    queryFn: async () => {
      const data = await api(`/schedules`, {
        method: 'GET',
        params: query,
      })
      return data
    },
    staleTime: 30 * 60 * 1000,
  })
}

export const fetchSchedule = (scheduleId: string) => {
  return queryOptions<ScheduleResponse>({
    queryKey: ['schedule', scheduleId],
    queryFn: async () => {
      const { data } = await api(`/schedules/${scheduleId}`, { method: 'GET' })
      return data
    },
    staleTime: 30 * 60 * 1000,
  })
}

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
    queryFn: async () => {
      const { data } = await api(`/appointments/me`, {
        method: 'GET',
        params: query,
      })
      return data
    },
    staleTime: 30 * 60 * 1000,
  })
}

export const fetchAppointment = (appointmentId: string) => {
  return queryOptions<{ data: Appointment }>({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const data = await api(`/appointments/${appointmentId}`, {
        method: 'GET',
      })
      return data
    },
    staleTime: 30 * 60 * 1000,
  })
}

export const mutateBookSlot = () => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: { slot_id: string; [k: string]: any }) => {
      const { slot_id, ...rest } = payload
      const { data } = await api(`/slots/${slot_id}/book`, {
        method: 'POST',
        data: JSON.stringify(rest),
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['slots'] })
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      showAlert(APPT_MSG.book.success, 'success')
    },
  })
}

const appointmentAction = (
  action: 'accept' | 'reject' | 'cancel' | 'complete',
  successMsg: string,
) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (
      payload: string | { id: string; body?: Record<string, any> },
    ) => {
      const appointmentId =
        typeof payload === 'string' ? payload : (payload as any).id
      const body =
        typeof payload === 'string' ? undefined : (payload as any).body

      const { data } = await api(`/appointments/${appointmentId}/${action}`, {
        method: 'POST',
        data: body ? JSON.stringify(body) : undefined,
      })
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      if (action === 'complete') {
        await queryClient.invalidateQueries({
          queryKey: ['clinician-patients'],
        })
      }
      showAlert(successMsg, 'success')
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
