import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import type { ServerAppointmentStatus } from '~/models/schedule'
import PageTitle from '~/components/Page/PageTitle'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import TablePagination from '~/components/Table/TablePagination'
import InputSelect from '~/components/Input/InputSelect'

import { patientMyAppointmentsQuery } from '~/api/appointments'
import MyAppointmentList from '~/modules/appointment/my/MyAppointmentList'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'NO_SHOW', label: 'No Show' },
]

export const Route = createFileRoute('/_private/(patient)/my-appointments/')({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page ?? 1)
    const perPage = Number(search.perPage ?? 10)
    const status =
      typeof search.status === 'string' && search.status
        ? (search.status as ServerAppointmentStatus)
        : undefined

    return {
      ...(page !== 1 ? { page } : {}),
      ...(perPage !== 10 ? { perPage } : {}),
      ...(status ? { status } : {}),
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  const page = search.page ?? 1
  const perPage = search.perPage ?? 10
  const status = search.status

  const { data, isLoading, error } = useQuery(
    patientMyAppointmentsQuery({ page, perPage, status }),
  )

  return (
    <>
      <PageTitle
        heading="My Appointments"
        subheading="View and track all your booked appointments."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <div className="flex flex-row gap-2">
            <InputSelect
              placeholder="All Statuses"
              options={STATUS_OPTIONS}
              value={status ?? ''}
              onChange={(value) =>
                navigate({
                  to: '.',
                  search: {
                    ...search,
                    status: (value || undefined) as
                      | ServerAppointmentStatus
                      | undefined,
                    page: 1,
                  },
                })
              }
              className="w-48"
            />
          </div>

          {isLoading && <LoaderTable />}
          {error && <SkeletonError />}
          {!isLoading && !error && !data && <SkeletonNull />}
          {data && data.data.length > 0 && (
            <>
              <MyAppointmentList data={data.data} />
              <TablePagination
                page={page}
                perPage={perPage}
                total={data.meta.total}
                lastPage={data.meta.page_count}
                from={data.meta.from}
                to={data.meta.to}
                onPageChange={(p) =>
                  navigate({ to: '.', search: { ...search, page: p } })
                }
                onPerPageChange={(pp) =>
                  navigate({
                    to: '.',
                    search: { ...search, perPage: pp, page: 1 },
                  })
                }
              />
            </>
          )}
        </GridItem>
      </Grid>
    </>
  )
}
