import { queryOptions } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import type { QueryParams, Meta } from '#/types/api'
import type { UsersParams } from '#/modules/users/types/params'

import type {
  AdminUser,
  CountResponse,
  UsersResponse,
} from '#/modules/users/types/user'

export const fetchUsers = (
  params: QueryParams = {},
  searchParams: UsersParams = {},
) => {
  const query = {
    page: params.page,

    search: searchParams.search,
    sort_by: searchParams.sort_by,
    sort: searchParams.sort,

    roles: searchParams.role,
    statuses: searchParams.account_status,
  }

  return queryOptions<UsersResponse>({
    queryKey: ['users', query],
    queryFn: async () => {
      const { data, meta } = await api<{ data: AdminUser[]; meta: Meta }>(
        '/api/v1/users',
        {
          method: 'GET',
          params: query,
        },
      )
      return { data, meta }
    },
    staleTime: 1000 * 60 * 30,
  })
}

export const fetchUser = (id: string) => {
  return queryOptions<AdminUser>({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await api<{ data: AdminUser }>(`/api/v1/users/${id}`, {
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

    roles: searchParams.role,
    statuses: searchParams.account_status,
  }
  return queryOptions<CountResponse>({
    queryKey: ['users-count', query],
    queryFn: async () => {
      const data = await api<CountResponse>('/api/v1/users/counts', {
        method: 'GET',
        params: query,
      })
      return data
    },
    staleTime: 1000 * 60 * 30,
    retry: false,
  })
}
