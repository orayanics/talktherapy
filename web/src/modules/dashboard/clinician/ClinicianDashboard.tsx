import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format, parseISO, startOfDay } from 'date-fns'
import { useState } from 'react'

import type {
  ClinicianDashboardSlot,
  ClinicianDashboardSlotsDto,
} from '~/models/booking'
import { slotsQuery } from '~/api/scheduling'
import CalenderSingle from '~/components/Calendar/CalenderSingle'
import InputMultiselect from '~/components/Input/InputMultiselect'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import TablePagination from '~/components/Table/TablePagination'

import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import {
  APPOINTMENT_STATUS_BADGE,
  APPOINTMENT_STATUS_TEXT,
  STATUS_OPTIONS,
} from '~/config/appointmentStatus'

export default function ClinicianDashboard() {
  const [selected, setSelected] = useState<Date | undefined>(
    startOfDay(new Date()),
  )
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [status, setStatus] = useState<Array<string>>([])

  const handleDateSelect = (date: Date | undefined) => {
    setSelected(date)
    setPage(1)
  }

  const handleStatusChange = (values: Array<string>) => {
    setStatus(values)
    setPage(1)
  }

  const { data, isLoading, isError } = useQuery(
    slotsQuery({
      date: selected,
      status,
      page,
      perPage,
    }),
  )
  const { data: slots, meta } = (data as ClinicianDashboardSlotsDto) || {}
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
          <InputMultiselect
            placeholder="Filter by status"
            options={STATUS_OPTIONS.filter((o) => o.value !== '')}
            value={status}
            onChange={handleStatusChange}
          />
          {isLoading ? (
            <LoaderTable />
          ) : isError ? (
            <SkeletonError />
          ) : !slots || slots.length === 0 ? (
            <SkeletonNull />
          ) : (
            slots.map((slot: ClinicianDashboardSlot) => (
              <SlotItem key={slot.id} {...slot} />
            ))
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

function SlotItem(props: ClinicianDashboardSlot) {
  const { starts_at, ends_at, status, id, appointments } = props
  const { status: appointmentStatus, patient } = appointments[0] || {}
  return (
    <ul className="list">
      <li className="p-4 flex justify-between border rounded-lg">
        <Link to={'/slots/$slotId'} params={{ slotId: id }} className="flex-1">
          <p>
            {format(parseISO(starts_at), 'pp')} -{' '}
            {format(parseISO(ends_at), 'pp')}
          </p>
          <span>{status}</span>
        </Link>
        {appointmentStatus && (
          <div className="flex flex-col items-end">
            <p>{patient.user.name}</p>
            <span className={APPOINTMENT_STATUS_BADGE[appointmentStatus]}>
              {APPOINTMENT_STATUS_TEXT[appointmentStatus]}
            </span>
          </div>
        )}
      </li>
    </ul>
  )
}
