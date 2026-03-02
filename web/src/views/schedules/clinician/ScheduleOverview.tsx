import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import PageTitle from '~/components/Page/PageTitle'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'

import CalenderSingle from '~/components/Calendar/CalenderSingle'
import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'

import ScheduleCard from '~/modules/schedule/list/ScheduleCard'

import { availabilityRulesQuery } from '~/api/scheduling'
import TablePagination from '~/components/Table/TablePagination'

interface ScheduleOverviewProps {
  search: Record<string, unknown>
}

export default function ScheduleOverview({ search }: ScheduleOverviewProps) {
  const [selected, setSelected] = useState<Date | undefined>(new Date())

  return (
    <>
      <PageTitle
        heading="Schedule Overview"
        subheading="View all of your schedules within the system."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-3">
          <CalenderSingle date={selected} onSelect={setSelected} />
          <button className="btn" onClick={() => setSelected(undefined)}>
            View All Schedules
          </button>
          <Link to="/schedules/create" className="btn btn-primary">
            Add New Schedule
          </Link>
        </GridItem>

        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-9">
          <p className="text-sm text-gray-500">
            These are your available schedules for the selected date. Filtered
            by your availability settings and timeslots.
          </p>
          <ScheduleList date={selected} search={search} />
        </GridItem>
      </Grid>
    </>
  )
}

function ScheduleList({
  date,
  search,
}: {
  date?: Date
  search: Record<string, unknown>
}) {
  const page = search.page ?? 1
  const perPage = search.perPage ?? 10

  const {
    data = [],
    isLoading,
    error,
  } = useQuery(
    availabilityRulesQuery({
      date,
      page: Number(page),
      perPage: Number(perPage),
    }),
  )

  const navigate = useNavigate()

  {
    !isLoading && !error && !data && <SkeletonNull />
  }
  if (isLoading) return <LoaderTable />
  if (error) return <SkeletonError />

  return (
    <>
      <ScheduleCard data={data.data} />

      <TablePagination
        page={Number(page)}
        perPage={data.meta.page_size}
        total={data.meta.total}
        onPageChange={(newPage) =>
          navigate({
            to: '.',
            search: { ...search, page: newPage },
          })
        }
        onPerPageChange={(newPerPage) =>
          navigate({
            to: '.',
            search: { ...search, perPage: newPerPage, page: 1 },
          })
        }
        from={data.meta.from}
        to={data.meta.to}
      />
    </>
  )
}
