import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuthGuard } from '~/hooks/useAuthGuard'

import { dashboardDataQueryOptions } from '~/api/dashboard'
import { sessionQueryOptions } from '~/api/auth'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'

import PatientDashboard from '~/views/dashboard/patient'
import AdminSharedDashboard from '~/views/dashboard/adm-shared/'
import ClinicianDashboard from '~/views/dashboard/clinician'

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

  const { data } = useQuery({
    ...dashboardDataQueryOptions,
    enabled: is('admin'),
  })

  const dashboardView = () => {
    if (is('admin')) return <AdminSharedDashboard {...data} />
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
