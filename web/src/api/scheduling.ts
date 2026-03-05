import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { format } from 'date-fns/format'

import type {
  AvailabilityRulesParams,
  PatientAppointmentsQueryParams,
} from '~/models/params'
import type {
  CreateAvailabilityPayload,
  UpdateAvailabilityPayload,
} from '~/models/payloads'

import { api } from '~/api/axios'
import { SCHEDULE } from '~/config/message'
import { useAlert } from '~/context/AlertContext'

// query options
export const availabilityRulesQuery = (params: AvailabilityRulesParams) =>
  queryOptions({
    queryKey: ['availability', 'list', params],
    queryFn: async () => {
      const apiParams = {
        ...(params.date && { from: format(params.date, 'yyyy-MM-dd') }),
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
      }
      const { data } = await api.get(`/scheduling/availability`, {
        params: apiParams,
      })
      return data
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

export const availabilityByIdQuery = (ruleId: string) =>
  queryOptions({
    queryKey: ['availability', ruleId],
    queryFn: async () => {
      const { data } = await api.get(`/scheduling/availability/${ruleId}`)
      return data
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

export const appointmentsQuery = (params: PatientAppointmentsQueryParams) =>
  queryOptions({
    queryKey: ['appointments', params],
    queryFn: async () => {
      const apiParams = {
        ...(params.date && { from: format(params.date, 'yyyy-MM-dd') }),
        ...(params.diagnosis && { diagnosis: params.diagnosis }),
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
      }
      const { data } = await api.get(`/scheduling/slots/available`, {
        params: apiParams,
      })
      return data
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

export const slotsQuery = (params: AvailabilityRulesParams) =>
  queryOptions({
    queryKey: ['slots', params],
    queryFn: async () => {
      const apiParams = {
        ...(params.date && {
          from: format(params.date, 'yyyy-MM-dd'),
          to: format(params.date, 'yyyy-MM-dd'),
        }),
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
      }
      const { data } = await api.get(`/scheduling/slots`, {
        params: apiParams,
      })
      return data
    },
    placeholderData: (prev) => prev,
    retry: false,
  })

/**
 * Fetches available slots for a specific clinician. Used by the patient
 * reschedule flow to show only slots belonging to the same clinician.
 */
export const clinicianAvailableSlotsQuery = (clinicianId: string) =>
  queryOptions({
    queryKey: ['appointments', 'available', 'clinician', clinicianId],
    queryFn: async () => {
      const { data } = await api.get(`/scheduling/slots/available`, {
        params: { clinician_id: clinicianId, per_page: 10 },
      })
      return data
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 2,
    retry: false,
  })

// mutations
export const useCreateSchedule = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: CreateAvailabilityPayload) => {
      const { data } = await api.post('/scheduling/availability', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      showAlert(SCHEDULE.create.success, 'success')
      navigate({ to: '/schedules' })
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to create:', error.response?.data)
      }
      showAlert(SCHEDULE.create.error, 'error')
    },
  })
}

export const useUpdateScheduleId = (ruleId: string) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: UpdateAvailabilityPayload) => {
      const { data } = await api.patch(
        `/scheduling/availability/${ruleId}`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      navigate({ to: '/schedules/$scheduleId', params: { scheduleId: ruleId } })
      queryClient.invalidateQueries({ queryKey: ['availability', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['availability', ruleId] })
      showAlert(SCHEDULE.update.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to update:', error.response?.data)
      }
      showAlert(SCHEDULE.update.error, 'error')
    },
  })
}

export const useDeleteScheduleId = (ruleId: string) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/scheduling/availability/${ruleId}`)
    },
    onSuccess: () => {
      navigate({ to: '/schedules' })
      queryClient.invalidateQueries({ queryKey: ['availability', 'list'] })
      showAlert(SCHEDULE.delete.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to delete:', error.response?.data)
      }
      showAlert(SCHEDULE.delete.error, 'error')
    },
  })
}

export const useDeleteSlotId = (slotId: string, ruleId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/scheduling/slots/${slotId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['availability', ruleId] })
      showAlert(SCHEDULE.delete.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to delete slot:', error.response?.data)
      }
      showAlert(SCHEDULE.delete.error, 'error')
    },
  })
}

// Schedule Rule
export const useUpdateScheduleStatus = (ruleId: string) => {
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(
        `/scheduling/availability/${ruleId}/status`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['availability', ruleId] })
      showAlert(SCHEDULE.update.success, 'success')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to update status:', error.response?.data)
      }
      showAlert(SCHEDULE.update.error, 'error')
    },
  })
}
