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
import type { CreateSchedulePayload } from '#/modules/schedules/types/schema'
import type { Slot, SlotsResponse } from '#/modules/schedules/types/slot'

export const fetchSlots = (
  params: QueryParams = {},
  searchParams: ScheduleParams = {},
) => {
  const query = {
    page: params.page,
    date_from: searchParams.from,
    date_to: searchParams.to,
    clinician_id: searchParams.clinician_id,
    diagnosis_values: searchParams.diagnosis,
    sort: searchParams.sort,
  }

  return queryOptions<SlotsResponse>({
    queryKey: ['slots', query],
    queryFn: async () =>
      api<SlotsResponse>('/api/v1/slots', { method: 'GET', params: query }),
    staleTime: 30 * 60 * 1000,
  })
}

export const fetchSlot = (slotId: string) =>
  queryOptions<Slot>({
    queryKey: ['slot', slotId],
    queryFn: async () =>
      (await api<{ data: Slot }>(`/api/v1/slots/${slotId}`, { method: 'GET' }))
        .data,
    staleTime: 30 * 60 * 1000,
  })

export const mutateSchedule = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: CreateSchedulePayload) =>
      api('/api/v1/schedules', {
        method: 'POST',
        data: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['slots'] })
      showAlert('Schedule created successfully', 'success')
      navigate({ to: '/schedules' })
    },
  })
}
