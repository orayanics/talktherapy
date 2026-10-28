import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { api } from '#/lib/api/client'
import { useAlert } from '#/context/AlertContext'
import type { QueryParams } from '#/types/api'
import type { ScheduleParams } from '#/modules/schedules/types/params'
import type { TSchedule } from '#/modules/schedules/types/schema'
import type {
  ScheduleResponse,
  SchedulesResponse,
  Slot,
  SlotsResponse,
} from '#/modules/schedules/types/slot'

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
    queryFn: async () =>
      (await api('/appointments/me/slots', { method: 'GET', params: query }))
        .data,
    staleTime: 30 * 60 * 1000,
  })
}
export const fetchSlot = (slotId: string) =>
  queryOptions<Slot>({
    queryKey: ['slot', slotId],
    queryFn: async () =>
      (await api(`/slots/${slotId}`, { method: 'GET' })).data,
    staleTime: 30 * 60 * 1000,
  })
export const mutateSchedule = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: TSchedule) =>
      (
        await api('/schedule', {
          method: 'POST',
          data: JSON.stringify(payload),
        })
      ).data,
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
    queryFn: async () =>
      (await api('/schedules', { method: 'GET', params: query })).data,
    staleTime: 30 * 60 * 1000,
  })
}
export const fetchSchedule = (scheduleId: string) =>
  queryOptions<ScheduleResponse>({
    queryKey: ['schedule', scheduleId],
    queryFn: async () =>
      (await api(`/schedules/${scheduleId}`, { method: 'GET' })).data,
    staleTime: 30 * 60 * 1000,
  })
