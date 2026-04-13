import { queryOptions, useMutation } from '@tanstack/react-query'
import { api } from './client'
import type { QueryParams, UsersParams, Meta } from '@/types/params'

import type { UserResponse } from './session'

export interface UsersCount {
  active_users: number
  inactive_users: number
  total: number
  suspended_users: number
  pending_users: number
}

export interface UsersResponse {
  data: (UserResponse & { status: string; diagnosis?: string })[]
  meta: Meta
}

export interface CountResponse {
  counts: UsersCount
}

export const fetchUsers = (
  params: QueryParams = {},
  searchParams: UsersParams = {},
) => {
  const query = {
    page: params.page,

    search: searchParams.search,
    sort_by: searchParams.sort_by,
    sort: searchParams.sort,

    role: searchParams.role,
    account_status: searchParams.account_status,
  }

  return queryOptions<UsersResponse>({
    queryKey: ['users', query],
    queryFn: async () => {
      const { data } = await api('/users', {
        method: 'GET',
        params: query,
      })
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}

export const fetchUser = (id: string) => {
  return queryOptions<UserResponse & { status: string }>({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await api(`/users/${id}`, {
        method: 'GET',
      })
      return data
    },
    staleTime: 1000 * 60 * 30,
    retry: false,
  })
}

export const fetchUsersCount = (searchParams: UsersParams = {}) => {
  const query = {
    search: searchParams.search,
    sort: searchParams.sort,

    role: searchParams.role,
    account_status: searchParams.account_status,
  }
  return queryOptions<CountResponse>({
    queryKey: ['users-count', query],
    queryFn: async () => {
      const data = await api('/users/counts', {
        method: 'GET',
        params: query,
      })
      return data
    },
    staleTime: 1000 * 60 * 30,
    retry: false,
  })
}

export const mutateDeleteUser = (id: string) => {
  return useMutation({
    mutationKey: ['delete-user', id],
    mutationFn: async () => {
      const data = await api(`/users/${id}`, {
        method: 'DELETE',
      })
      return data
    },
  })
}
