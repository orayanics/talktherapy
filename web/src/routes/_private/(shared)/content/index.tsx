import { createFileRoute } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'

import ContentList from '~/modules/content/ContentList'

import { normalizeSearchArray } from '~/utils/query'

import { useGetPublicDiagnoses } from '~/api/public'
import { contentListQueryOptions } from '~/api/content'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'

export const Route = createFileRoute('/_private/(shared)/content/')({
  validateSearch: (search: Record<string, unknown>) => {
    const searchTerm =
      typeof search.search === 'string' ? search.search : undefined
    const diagnosis = normalizeSearchArray(search.diagnosis)
    const page = Number(search.page ?? 1)
    const perPage = Number(search.perPage ?? 10)

    return {
      ...(page !== 1 ? { page } : {}),
      ...(perPage !== 10 ? { perPage } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(diagnosis.length ? { diagnosis } : {}),
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()

  const [diagnosesQuery, contentQuery] = useQueries({
    queries: [
      { ...useGetPublicDiagnoses },
      contentListQueryOptions({
        page: search.page,
        perPage: search.perPage,
        search: search.search,
        diagnosis: search.diagnosis,
      }),
    ],
  })

  const isLoading = diagnosesQuery.isLoading || contentQuery.isLoading
  const isError = diagnosesQuery.isError || contentQuery.isError
  const diagnoses = diagnosesQuery.data?.data
  const content = contentQuery.data

  return (
    <>
      <PageTitle
        heading="Content Media"
        subheading="View all available speech therapy exercises in the system."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <ContentList
            search={search}
            isLoading={isLoading}
            isError={isError}
            data={{
              content,
              diagnoses,
            }}
          />
        </GridItem>
      </Grid>
    </>
  )
}
