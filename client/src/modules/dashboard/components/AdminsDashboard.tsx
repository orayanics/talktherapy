import {
  fetchAdminStats,
  fetchDashboardSummary,
} from '#/modules/dashboard/api/dashboard'
import { useQuery } from '@tanstack/react-query'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import UserDistribution from './admin/UserDistribution'
import PatientsByDiagnosis from './admin/PatientsByDiagnosis'
import SlotsSummary from './admin/SlotsSummary'
import AppointmentsSummary from './admin/AppointmentsSummary'
import { AdminSummary } from './admin/AdminSummary'

export default function AdminsDashboard() {
  const statsQ = useQuery(fetchAdminStats())
  const summaryQ = useQuery(fetchDashboardSummary())

  if (statsQ.isPending) return <StateLoading />
  if (statsQ.isError) return <StateError />

  const stats = statsQ.data
  const summary = summaryQ.data

  return (
    <div className="space-y-6">
      <AdminSummary summary={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PatientsByDiagnosis stats={stats} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UserDistribution stats={stats} />
          <SlotsSummary stats={stats} />
          <AppointmentsSummary stats={stats} />
        </div>
      </div>
    </div>
  )
}
