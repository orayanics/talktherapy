import { api } from '#/lib/api/client'
import { queryOptions } from '@tanstack/react-query'

export interface AdminStats {
  users: { total: number; by_role: Record<string, number> }
  appointments: Record<string, number>
  slots: Record<string, number>
}

export const fetchAdminStats = () => {
  return queryOptions<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api<{ data: AdminStats }>('/api/v1/reports/stats', { method: 'GET' })
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })
}
