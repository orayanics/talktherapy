import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { RecordListItem } from '~/models/table'
import PageTitle from '~/components/Page/PageTitle'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'

import { patientSoapsQuery } from '~/api/soap'
import RecordsList from '~/modules/records/RecordsList'
import RecordDetail from '~/modules/records/RecordDetail'

export const Route = createFileRoute('/_private/(patient)/records/')({
  validateSearch: (search: Record<string, unknown>) => {
    const searchTerm =
      typeof search.search === 'string' ? search.search : undefined
    const date = typeof search.date === 'string' ? search.date : undefined
    const page = Number(search.page ?? 1)
    const perPage = Number(search.perPage ?? 10)

    return {
      ...(page !== 1 ? { page } : {}),
      ...(perPage !== 10 ? { perPage } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(date ? { date } : {}),
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const [selected, setSelected] = useState<RecordListItem | undefined>()

  const { data, isLoading, isError } = useQuery(
    patientSoapsQuery({
      from: search.date,
      to: search.date,
      clinician_name: search.search,
      page: search.page,
      perPage: search.perPage,
    }),
  )

  const handleSelect = (record: RecordListItem) => {
    setSelected((prev) => (prev?.id === record.id ? undefined : record))
  }

  return (
    <>
      <PageTitle
        heading="Feedback and Diagnosis"
        subheading="View your medical records and feedback from your healthcare providers."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={4} className="flex flex-col gap-4">
          <RecordsList
            data={data}
            search={search}
            isLoading={isLoading}
            isError={isError}
            selectedId={selected?.id}
            onSelect={handleSelect}
          />
        </GridItem>

        <GridItem colSpan={8}>
          {selected ? (
            <RecordDetail record={selected} />
          ) : (
            <div className="flex items-center justify-center h-48 border rounded-lg opacity-40">
              <p className="text-sm">Select a record to view details</p>
            </div>
          )}
        </GridItem>
      </Grid>
    </>
  )
}
