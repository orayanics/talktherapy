import { createFileRoute } from '@tanstack/react-router'
import { useAuthGuard } from '~/hooks/useAuthGuard'

import { sessionQueryOptions } from '~/api/auth'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'

import AdminSharedDashboard from '~/modules/dashboard/AdminDashboard'
import ClinicianDashboard from '~/modules/dashboard/clinician/ClinicianDashboard'
import PatientDashboard from '~/modules/dashboard/patient/PatientDashboard'

export const Route = createFileRoute('/_private/dashboard')({
  ssr: false,
  loader: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(sessionQueryOptions)
    return session
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { is } = useAuthGuard()
  const dashboardView = () => {
    if (is('admin')) return <AdminSharedDashboard />
    if (is('clinician')) return <ClinicianDashboard />
    if (is('patient')) return <PatientDashboard />
  }

  return (
    <>
      <PageTitle
        heading="Dashboard"
        subheading="Overview and different key actions"
      />
      <Grid cols={12} gap={2}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          {dashboardView()}
        </GridItem>
      </Grid>
    </>
  )
}
