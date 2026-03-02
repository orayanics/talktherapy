import { createFileRoute } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'

import SharedContentOverview from '~/views/content/shared/ContentOverview'

import { normalizeSearchArray } from '~/utils/query'

import { useGetPublicDiagnoses } from '~/api/public'
import { contentListQueryOptions } from '~/api/content'

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
  const diagnoses = diagnosesQuery.data
  const content = contentQuery.data

  return (
    <SharedContentOverview
      search={search}
      isLoading={isLoading}
      isError={isError}
      data={{
        diagnoses,
        content,
      }}
    />
  )
}
