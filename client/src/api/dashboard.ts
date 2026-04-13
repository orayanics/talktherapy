import type { USER_ROLE } from '@/types/account'
import { api } from './client'
import { queryOptions } from '@tanstack/react-query'
import type { APPOINTMENT_STATUS, SLOT_STATUS } from './schedule'

export interface AdminStats {
  totalUsers: number
  usersByRole: Record<USER_ROLE, number>
  appointmentsByStatus: Record<APPOINTMENT_STATUS, number>
  slotsByStatus: Record<SLOT_STATUS, number>
}

export const fetchAdminStats = () => {
  return queryOptions<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await api('/admin/stats', { method: 'GET' })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}
