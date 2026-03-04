import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import MyPatientList from '~/modules/patients/MyPatientList'
import { clinicianMyPatientsQuery } from '~/api/clinician'
import PageTitle from '~/components/Page/PageTitle'
import GridItem from '~/components/Page/GridItem'
import Grid from '~/components/Page/Grid'

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

  return (
    <>
      <PageTitle
        heading="My Patients"
        subheading="View all your handled patients in the system."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <MyPatientList
            search={search}
            isLoading={isLoading}
            isError={isError}
            data={data}
          />
        </GridItem>
      </Grid>
    </>
  )
}
