import type { DashboardSummary } from '../api/dashboard'

export function pendingCount(summary: DashboardSummary) {
  return typeof summary.appointments.pending === 'number'
    ? summary.appointments.pending
    : summary.appointments.pending.count
}

export function periodTotal(summary: DashboardSummary) {
  return Object.values(summary.appointments.period).reduce(
    (total, count) => total + count,
    0,
  )
}

export function rateLabel(rate: number | null | undefined) {
  return rate == null ? '—' : `${Math.round(rate * 100)}%`
}

export function appointmentRedirect(summary: DashboardSummary, status: string) {
  return summary.role === 'superadmin'
    ? { to: '/appointments', search: { status: [status] } }
    : undefined
}
