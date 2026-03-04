import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import PatientClinicianOverview from '~/modules/patients/PatientClinicianOverview'
import { clinicianMyPatientsQuery } from '~/api/clinician'

export const Route = createFileRoute('/_private/(clinician)/patients/')({
  validateSearch: (search: Record<string, unknown>) => {
    const searchTerm =
      typeof search.search === 'string' ? search.search : undefined
    const page = Number(search.page ?? 1)
    const perPage = Number(search.perPage ?? 10)

    return {
      ...(page !== 1 ? { page } : {}),
      ...(perPage !== 10 ? { perPage } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const { data, isLoading, isError } = useQuery(
    clinicianMyPatientsQuery({
      search: search.search,
      page: search.page,
      perPage: search.perPage,
    }),
  )

  console.log(data)
  return (
    <PatientClinicianOverview
      search={search}
      isLoading={isLoading}
      isError={isError}
      data={data}
    />
  )
}
