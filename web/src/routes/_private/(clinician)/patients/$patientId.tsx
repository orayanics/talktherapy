import { createFileRoute, useNavigate } from '@tanstack/react-router'

import PageTitle from '~/components/Page/PageTitle'
import {
  clinicianPatientDetailQuery,
  clinicianPatientSoapsQuery,
} from '~/api/clinician'
import PatientDetailView from '~/modules/patients/PatientDetailView'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId',
)({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page ?? 1),
    perPage: Number(search.perPage ?? 10),
    ...(typeof search.from === 'string' ? { from: search.from } : {}),
    ...(typeof search.to === 'string' ? { to: search.to } : {}),
  }),
  loaderDeps: ({ search }) => ({
    from: search.from,
    to: search.to,
    page: search.page,
    perPage: search.perPage,
  }),
  loader: async ({ context: { queryClient }, params, deps }) => {
    const [patientDetail, soaps] = await Promise.all([
      queryClient.ensureQueryData(
        clinicianPatientDetailQuery(params.patientId, {
          from: deps.from,
          to: deps.to,
          page: deps.page,
          perPage: deps.perPage,
        }),
      ),
      queryClient.ensureQueryData(clinicianPatientSoapsQuery(params.patientId)),
    ])
    return { patientDetail, soaps }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { patientDetail, soaps } = Route.useLoaderData()
  const { patientId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()

  function handlePageChange(page: number) {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, page }),
    })
  }

  return (
    <>
      <PageTitle
        heading="Patient Overview"
        subheading="View patient profile, appointment history, and SOAP notes."
      />
      <PatientDetailView
        patientId={patientId}
        initialPatientDetail={patientDetail}
        initialSoaps={soaps}
        search={search}
        onPageChange={handlePageChange}
      />
    </>
  )
}
