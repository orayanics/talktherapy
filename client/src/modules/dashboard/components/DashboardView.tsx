import {
  fetchAdminStats,
  fetchDashboardSummary,
} from '#/modules/dashboard/api/dashboard'
import { useQuery } from '@tanstack/react-query'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import UserDistribution from './UserDistribution'
import PatientsByDiagnosis from './PatientsByDiagnosis'
import SlotsSummary from './SlotsSummary'
import AppointmentsSummary from './AppointmentsSummary'
import { AdminSummaryCards } from './DashboardSummaryCards'

export default function DashboardView() {
  const statsQ = useQuery(fetchAdminStats())
  const summaryQ = useQuery(fetchDashboardSummary())

  if (statsQ.isPending) return <StateLoading />
  if (statsQ.isError) return <StateError />

  const stats = statsQ.data
  const summary = summaryQ.data

  return (
    <div className="space-y-6">
      <AdminSummaryCards summary={summary} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PatientsByDiagnosis stats={stats} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UserDistribution stats={stats} />
          <SlotsSummary stats={stats} />
          <AppointmentsSummary stats={stats} />
        </div>
      </div>
    </div>
  )
}
