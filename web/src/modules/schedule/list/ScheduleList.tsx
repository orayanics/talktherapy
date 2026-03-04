import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import type { ScheduleListProps } from '~/models/table'

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

export default function ScheduleList({ search }: ScheduleListProps) {
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
          <ScheduleTable date={selected} search={search} />
        </GridItem>
      </Grid>
    </>
  )
}

function ScheduleTable({
  date,
  search,
}: {
  date?: Date
  search: ScheduleListProps['search']
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

  const { data: schedulesData, meta } = data
  const { total, from, to } = meta || {
    total: 0,
    from: null,
    to: null,
  }

  const navigate = useNavigate()

  return (
    <>
      {isLoading ? (
        <LoaderTable />
      ) : error ? (
        <SkeletonError />
      ) : schedulesData && schedulesData.length > 0 ? (
        <ScheduleCard data={schedulesData} />
      ) : (
        <SkeletonNull />
      )}

      <TablePagination
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={(q: number) =>
          navigate({
            from: '/schedules',
            to: '.',
            search: { ...search, page: q },
          })
        }
        onPerPageChange={(q: number) =>
          navigate({
            from: '/schedules',
            to: '.',
            search: { ...search, perPage: q, page: 1 },
          })
        }
        from={from}
        to={to}
      />
    </>
  )
}
