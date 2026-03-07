import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import type { SoapDto } from '~/models/booking'
import { clinicianPatientSoapsQuery } from '~/api/clinician'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'
import TableContent from '~/components/Table/TableContent'
import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import TablePagination from '~/components/Table/TablePagination'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId_/records',
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
  const { patientId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const [selectedSoap, setSelectedSoap] = useState<SoapDto | null>(null)

  const { data, isLoading, isError } = useQuery(
    clinicianPatientSoapsQuery(patientId, {
      page: search.page,
      perPage: search.perPage,
    }),
  )

  return (
    <>
      <PageTitle
        heading="Patient Records"
        subheading="View SOAP notes and other records for this patient."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-6">
          <button className="btn btn-primary">Add SOAP</button>
          {isLoading ? (
            <LoaderTable />
          ) : isError ? (
            <SkeletonError />
          ) : !data ? (
            <SkeletonNull />
          ) : (
            <>
              <SoapList
                data={data.data}
                selectedSoapId={selectedSoap?.id}
                onSelect={setSelectedSoap}
              />

              <TablePagination
                total={data.meta.total}
                page={data.meta.page}
                perPage={data.meta.per_page}
                to={data.meta.to}
                from={data.meta.from}
                onPageChange={(q: number) => {
                  navigate({
                    from: '/patients/$patientId/records',
                    search: { ...search, page: q, perPage: search.perPage },
                  })
                }}
                onPerPageChange={(q: number) => {
                  navigate({
                    from: '/patients/$patientId/records',
                    search: { ...search, page: 1, perPage: q },
                  })
                }}
              />
            </>
          )}
        </GridItem>
        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-6">
          {selectedSoap ? (
            <SoapDetailView soap={selectedSoap} />
          ) : (
            <div className="flex items-center justify-center h-40 rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
              Select a record to view details
            </div>
          )}
        </GridItem>
      </Grid>
    </>
  )
}

interface SoapListProps {
  data: Array<SoapDto>
  selectedSoapId?: string
  onSelect: (soap: SoapDto) => void
}

function SoapList({ data, selectedSoapId, onSelect }: SoapListProps) {
  return (
    <TableContent
      columns={[
        {
          header: 'Date',
          accessor: 'created_at',
          render: (created_at) => format(new Date(created_at), 'MM/dd/yyyy'),
        },
        { header: 'Activity Plan', accessor: 'activity_plan' },
        { header: 'Session', accessor: 'session_type' },
        { header: 'Assessment', accessor: 'assessment' },
      ]}
      data={data}
      selectedRowId={selectedSoapId}
      onRowClick={onSelect}
    />
  )
}

interface SoapDetailViewProps {
  soap: SoapDto
}

const SOAP_FIELDS: Array<{ label: string; key: keyof SoapDto }> = [
  { label: 'Session Type', key: 'session_type' },
  { label: 'Activity Plan', key: 'activity_plan' },
  { label: 'Subjective Notes', key: 'subjective_notes' },
  { label: 'Objective Notes', key: 'objective_notes' },
  { label: 'Assessment', key: 'assessment' },
  { label: 'Recommendation', key: 'recommendation' },
  { label: 'Comments', key: 'comments' },
]

function SoapDetailView({ soap }: SoapDetailViewProps) {
  return (
    <div className="flex flex-col gap-4 overflow-auto max-h-200 bg-white rounded-lg border p-6">
      <div className="flex flex-col gap-1 border-b border-dashed border-gray-200 pb-4">
        <p className="font-bold uppercase text-primary text-sm">SOAP Record</p>
        <p className="text-xs text-gray-400">
          Created {format(new Date(soap.created_at), 'MMMM d, yyyy')}
        </p>
      </div>

      {SOAP_FIELDS.map(({ label, key }) => {
        const value = soap[key]
        if (!value) return null
        return (
          <div
            key={key}
            className="flex flex-col gap-1 py-3 border-b border-dashed border-gray-100 last:border-b-0"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {label}
            </p>
            <div className="prose prose-sm max-w-none text-gray-800 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-3">
              <Markdown rehypePlugins={[rehypeRaw]}>{String(value)}</Markdown>
            </div>
          </div>
        )
      })}
    </div>
  )
}
