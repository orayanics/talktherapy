import { api } from '#/lib/api/client'
import { queryOptions } from '@tanstack/react-query'

export interface AdminStats {
  users: {
    total: number
    by_role: Record<string, number>
    by_diagnosis: Array<{ value: string; label: string; count: number }>
  }
  appointments: Record<string, number>
  slots: Record<string, number>
}

export interface DashboardSummary {
  role: 'admin' | 'superadmin' | 'clinician' | 'patient'
  period: { from: string; to: string; timezone: string }
  appointments: {
    period: Record<string, number>
    total: number
    rates: { completed: number | null; cancelled: number | null }
    pending: number | { count: number; oldest_at: string | null }
    schedule?: Record<string, number>
    next?: {
      id: string
      start_at: string
      end_at: string
      status: string
      patient?: { id: string; name: string }
      clinician?: { id: string; name: string }
    } | null
  }
  slots?: {
    booking_share: { occupied: number; eligible: number; rate: number | null }
    available: number
  }
  accounts?: {
    awaiting_activation: number
    suspended: number
    active_patients: number
    active_clinicians: number
  }
  patients?: { seen: number }
  practice?: {
    active_assignments: number
    submissions_this_week?: number
    progress?: null
  }
}

export const fetchAdminStats = () => {
  return queryOptions<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api<{ data: AdminStats }>(
        '/api/v1/reports/stats',
        { method: 'GET' },
      )
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const fetchDashboardSummary = (
  params: { date_from?: string; date_to?: string } = {},
) =>
  queryOptions<DashboardSummary>({
    queryKey: ['dashboardSummary', params],
    queryFn: async () => {
      const response = await api<{ data: DashboardSummary }>(
        '/api/v1/dashboard/summary',
        { method: 'GET', params },
      )
      return response.data
    },
    staleTime: 1000 * 60,
  })
