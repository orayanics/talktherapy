import { queryOptions } from '@tanstack/react-query'
import { api } from '~/api/axios'

// query options
export const dashboardDataQueryOptions = queryOptions({
  queryKey: ['dashboardData'],
  queryFn: async () => {
    const { data } = await api.get('/auth/users/count')
    return data
  },
  staleTime: 1000 * 60 * 5,
})
