import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ServerAppointmentStatus } from '~/models/booking'

import { STATUS_OPTIONS } from '~/config/appointmentStatus'
import { patientMyAppointmentsQuery } from '~/api/appointments'
import InputSelect from '~/components/Input/InputSelect'
import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import TablePagination from '~/components/Table/TablePagination'
import MyAppointmentList from '~/modules/appointment/my/MyAppointmentList'

export default function PatientAppointments() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [status, setStatus] = useState<ServerAppointmentStatus | undefined>(
    undefined,
  )

  const { data, isLoading, isError } = useQuery(
    patientMyAppointmentsQuery({ page, perPage, status }),
  )
  const { data: appointments, meta } = data || {}
  const { total, last_page, from, to } = meta || {}

  return (
    <>
      <div className="flex flex-row gap-2">
        <InputSelect
          placeholder="All Statuses"
          options={STATUS_OPTIONS}
          value={status ?? ''}
          onChange={(e) => setStatus(e as ServerAppointmentStatus | undefined)}
          className="w-48"
        />
      </div>

      {isLoading ? (
        <LoaderTable />
      ) : isError ? (
        <SkeletonError />
      ) : !appointments || appointments.length === 0 ? (
        <SkeletonNull />
      ) : (
        <MyAppointmentList data={appointments} />
      )}

      <TablePagination
        page={page}
        perPage={perPage}
        total={total}
        lastPage={last_page}
        from={from}
        to={to}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value)
          setPage(1)
        }}
      />
    </>
  )
}
