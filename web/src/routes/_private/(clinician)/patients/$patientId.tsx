import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import PageTitle from '~/components/Page/PageTitle'

import { clinicianPatientDetailQuery } from '~/api/clinician'
import PatientDetail from '~/modules/patients/detail/PatientDetail'

import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import AppointmentList from '~/modules/patients/detail/AppointmentList'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId',
)({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page ?? 1)
    const perPage = Number(search.perPage ?? 10)

    return {
      page,
      perPage,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const { patientId } = Route.useParams()
  const { data, isLoading, isError } = useQuery(
    clinicianPatientDetailQuery(patientId, {
      page: search.page,
      perPage: search.perPage,
    }),
  )
  const navigate = useNavigate()
  return (
    <>
      <PageTitle
        heading="Patient Detail"
        subheading="View patient profile, appointment history, and SOAP notes."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-6">
          {isLoading ? (
            <LoaderTable />
          ) : isError ? (
            <SkeletonError />
          ) : !data?.patient ? (
            <SkeletonNull />
          ) : (
            <>
              <PatientDetail {...data.patient} />
              <button
                className="btn btn-primary"
                onClick={() =>
                  navigate({
                    to: '/patients/$patientId/records',
                    params: { patientId },
                    search: {
                      page: search.page,
                      perPage: search.perPage,
                    },
                  })
                }
              >
                View SOAP Notes
              </button>
            </>
          )}
        </GridItem>

        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-6">
          {isLoading ? (
            <LoaderTable />
          ) : isError ? (
            <SkeletonError />
          ) : !data?.appointments ? (
            <SkeletonNull />
          ) : (
            <AppointmentList search={search} {...data.appointments} />
          )}
        </GridItem>
      </Grid>
    </>
  )
}
