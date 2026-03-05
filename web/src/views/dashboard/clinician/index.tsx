import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format, startOfDay } from 'date-fns'
import { useState } from 'react'

import { slotsQuery } from '~/api/scheduling'
import CalenderSingle from '~/components/Calendar/CalenderSingle'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import TablePagination from '~/components/Table/TablePagination'

import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'

export default function ClinicianDashboard() {
  const [selected, setSelected] = useState<Date | undefined>(
    startOfDay(new Date()),
  )
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const handleDateSelect = (date: Date | undefined) => {
    setSelected(date)
    setPage(1)
  }

  const { data, isLoading, isError } = useQuery(
    slotsQuery({
      date: selected,
      page,
      perPage,
    }),
  )
  const { data: slots, meta } = data || {}
  const {
    page: metaPage,
    per_page: metaPerPage,
    total,
    last_page,
    from,
    to,
  } = meta || {}

  return (
    <>
      <Grid cols={12} gap={2}>
        <GridItem colSpan={12} className="lg:col-span-6 flex flex-col gap-4">
          <CalenderSingle date={selected} onSelect={handleDateSelect} />
          <button
            className="btn btn-primary"
            onClick={() => handleDateSelect(undefined)}
          >
            View All
          </button>
        </GridItem>
        <GridItem colSpan={12} className="lg:col-span-6 flex flex-col gap-4">
          <p className="font-mono uppercase text-primary">Today's Schedule</p>
          {isLoading ? (
            <LoaderTable />
          ) : isError ? (
            <SkeletonError />
          ) : !slots || slots.length === 0 ? (
            <SkeletonNull />
          ) : (
            slots.map((slot: any) => <SlotItem key={slot.id} {...slot} />)
          )}
          <TablePagination
            page={metaPage ?? page}
            perPage={metaPerPage ?? perPage}
            total={total ?? 0}
            lastPage={last_page}
            from={from}
            to={to}
            onPageChange={setPage}
            onPerPageChange={(value) => {
              setPerPage(value)
              setPage(1)
            }}
          />
        </GridItem>
      </Grid>
    </>
  )
}

function SlotItem(props: any) {
  const { starts_at, ends_at, status, id, appointments } = props
  const { status: appointmentStatus, patient } = appointments[0] || {}
  return (
    <ul className="list">
      <li className="p-4 flex justify-between border rounded-lg">
        <Link to={'/slots/$slotId'} params={{ slotId: id }} className="flex-1">
          <p>
            {format(new Date(starts_at), 'pp')} -{' '}
            {format(new Date(ends_at), 'pp')}
          </p>
          <span>{status}</span>
        </Link>
        {appointmentStatus && (
          <div>
            <p>{patient.user.name}</p>
            <p className="text-xs text-right uppercase font-semibold opacity-60">
              {appointmentStatus}
            </p>
          </div>
        )}
      </li>
    </ul>
  )
}
