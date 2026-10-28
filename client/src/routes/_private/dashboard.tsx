import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '#/modules/auth/context/SessionContext'

import DashboardView from '#/modules/dashboard/components/DashboardView'
import ClinicianDashboard from '#/modules/dashboard/components/ClinicianDashboard'
import PatientDashboard from '#/modules/dashboard/components/PatientDashboard'

export const Route = createFileRoute('/_private/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const session = useSession()
  const role = session.role

  if (role === 'superadmin' || role === 'admin') return <DashboardView />

  // Clinician gets a focused dashboard for today's appointments
  if (role === 'clinician') return <ClinicianDashboard />

  // Patient gets a dashboard showing upcoming appointments and bookmarks
  return <PatientDashboard />
}
