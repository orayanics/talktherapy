import { queryOptions } from '@tanstack/react-query'
import { api } from '~/api/axios'

export interface LogsParams {
  page?: number
  perPage?: number
  search?: string
  action?: string
  date_from?: string
  date_to?: string
}

export const logsQueryOptions = (params: LogsParams) =>
  queryOptions({
    queryKey: ['logs', params],
    queryFn: async () => {
      const { data } = await api.get('/logs', {
        params: {
          page: params.page ?? 1,
          per_page: params.perPage ?? 10,
          search: params.search || undefined,
          action: params.action || undefined,
          date_from: params.date_from || undefined,
          date_to: params.date_to || undefined,
        },
      })
      return data
    },
    placeholderData: (prev) => prev,
  })
