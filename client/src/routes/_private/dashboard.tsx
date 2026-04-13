import { createFileRoute, Navigate } from '@tanstack/react-router'
import type { USER_ROLE } from '@/types/account'
import { useSession } from '@/context/SessionContext'

import DashboardView from '@/modules/dashboard/DashboardView'
import ClinicianDashboard from '@/modules/dashboard/ClinicianDashboard'
import PatientDashboard from '@/modules/dashboard/PatientDashboard'

export const Route = createFileRoute('/_private/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const session = useSession()
  const role = session.role as USER_ROLE

  if (role === 'superadmin' || role === 'admin') return <DashboardView />

  // Clinician gets a focused dashboard for today's appointments
  if (role === 'clinician') return <ClinicianDashboard />

  // Patient gets a dashboard showing upcoming appointments and bookmarks
  if (role === 'patient') return <PatientDashboard />

  return <Navigate to="/unauthorized" />
}
