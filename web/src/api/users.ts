import { useNavigate } from '@tanstack/react-router'
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import type {
  AdminRegisterPayload,
  ClinicianRegisterPayload,
} from '~/models/payloads'
import type { UsersParams } from '~/models/params'

import { api } from '~/api/axios'

import { useAlert } from '~/context/AlertContext'
import { USER } from '~/config/message'

export const usersQueryOptions = (params: UsersParams) =>
  queryOptions({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await api.get('/users', {
        params: {
          search: params.search || undefined,
          account_status: params.account_status,
          account_role: params.account_role,
          page: params.page ?? 1,
          per_page: params.perPage ?? 10,
        },
      })
      return data
    },
    placeholderData: (prev) => prev, // keeps stale data visible during page transitions
  })

export const userDetailQueryOptions = (userId: string) => {
  return queryOptions({
    queryKey: ['users', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}`)
      return data
    },
  })
}

export const useAddClinician = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: ClinicianRegisterPayload) => {
      const { data } = await api.post(`/auth/signup/clinician`, payload)
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      showAlert(USER.create.success, 'success')
      navigate({
        to: '/users',
        search: {
          page: 1,
          perPage: 10,
          role: [],
          status: [],
        },
      })
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to add clinician:', error.response?.data)
      }
      showAlert(USER.create.error, 'error')
    },
  })
}

export const useAddAdmin = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: AdminRegisterPayload) => {
      const { data } = await api.post(`/auth/signup/admin`, payload)
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      showAlert(USER.create.success, 'success')

      navigate({
        to: '/users',
        search: {
          page: 1,
          perPage: 10,
          role: [],
          status: [],
        },
      })
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error('Failed to add admin:', error.response?.data)
      }
      showAlert(USER.create.error, 'error')
    },
  })
}
