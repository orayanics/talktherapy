import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '#/modules/auth/context/SessionContext'

import AdminsDashboard from '#/modules/dashboard/components/AdminsDashboard'
import ClinicianDashboard from '#/modules/dashboard/components/ClinicianDashboard'
import PatientDashboard from '#/modules/dashboard/components/PatientDashboard'
import PageLayout from '#/components/Page/PageLayout'
import { PAGE_META } from '#/constants/pageMeta'

export const Route = createFileRoute('/_private/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const session = useSession()
  const role = session.role

  const dashboard =
    role === 'superadmin' || role === 'admin' ? (
      <AdminsDashboard />
    ) : role === 'clinician' ? (
      <ClinicianDashboard />
    ) : (
      <PatientDashboard />
    )

  return (
    <PageLayout
      title={PAGE_META.dashboard.title}
      description={PAGE_META.dashboard.description}
      paddedCh
    >
      {dashboard}
    </PageLayout>
  )
}
