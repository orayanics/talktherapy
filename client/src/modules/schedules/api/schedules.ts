import { retryApiQuery } from '#/lib/api/query'

import { queryOptions } from '@tanstack/react-query'

import { api } from '#/lib/api/client'

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
    retry: retryApiQuery,
    queryFn: async ({ signal }) =>
      api<SlotsResponse>('/api/v1/slots', {
        method: 'GET',
        signal,
        params: query,
      }),
    staleTime: 30 * 60 * 1000,
  })
}

export const fetchSlot = (slotId: string) =>
  queryOptions<Slot>({
    queryKey: ['slot', slotId],
    retry: retryApiQuery,
    queryFn: async ({ signal }) =>
      (
        await api<{ data: Slot }>(`/api/v1/slots/${slotId}`, {
          method: 'GET',
          signal,
        })
      ).data,
    staleTime: 30 * 60 * 1000,
  })

export const mutateSchedule = async (payload: CreateSchedulePayload) =>
  api('/api/v1/schedules', {
    method: 'POST',
    data: JSON.stringify(payload),
  })

export const mutateHideSlot = async (slotId: string) =>
  api(`/api/v1/slots/${slotId}/hide`, { method: 'POST' })
