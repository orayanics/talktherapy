import { useNavigate } from '@tanstack/react-router'
import { useMutation, queryOptions } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { api } from '~/api/axios'
import {
  ClinicianRegisterPayload,
  AdminRegisterPayload,
} from '~/models/user/credentials'

import { UsersParams } from '~/models/system'
import { useAlert } from '~/context/AlertContext'
import { USER } from '~/config/message'

export const usersQueryOptions = (params: UsersParams) =>
  queryOptions({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await api.get('/auth/users', {
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
      const { data } = await api.get(`/auth/users/${userId}`)
      return data
    },
  })
}

export const useAddClinician = () => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  return useMutation({
    mutationFn: async (payload: ClinicianRegisterPayload) => {
      const { data } = await api.post(`/auth/register/clinician`, payload)
      return data
    },
    onSuccess: () => {
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
  const { showAlert } = useAlert()
  return useMutation({
    mutationFn: async (payload: AdminRegisterPayload) => {
      const { data } = await api.post(`/auth/register/admin`, payload)
      return data
    },
    onSuccess: () => {
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
