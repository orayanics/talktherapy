import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import type { SoapDto } from '~/models/booking'
import { clinicianPatientSoapsQuery } from '~/api/clinician'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import PageTitle from '~/components/Page/PageTitle'
import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import TablePagination from '~/components/Table/TablePagination'

import SoapList from '~/modules/patients/soap/SoapList'
import SoapDetail from '~/modules/patients/soap/SoapDetail'

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
          <button
            className="btn btn-primary"
            onClick={() => {
              navigate({
                from: '/patients/$patientId/records',
                to: '/patients/$patientId/add',
              })
            }}
          >
            Add SOAP
          </button>
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
            <SoapDetail soap={selectedSoap} />
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
