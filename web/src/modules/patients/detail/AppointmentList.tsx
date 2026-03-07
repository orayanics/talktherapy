import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import type { ClinicianPatientDetailAppointmentDto } from '~/models/booking'
import TableContent from '~/components/Table/TableContent'
import TablePagination from '~/components/Table/TablePagination'

interface AppoinmentListProps {
  data?: Array<ClinicianPatientDetailAppointmentDto>
  meta: {
    total: number
    page: number
    per_page: number
    to: number
    from: number
  }
  search: {
    page?: number
    perPage?: number
    date?: string
  }
}

export default function AppointmentList({
  data,
  meta,
  search,
}: AppoinmentListProps) {
  const navigate = useNavigate()
  const { total, page, per_page, to, from } = meta
  const { page: cPage = 1, perPage: cPp = 10 } = search

  return (
    <>
      <TableContent
        columns={[
          {
            header: 'Date',
            accessor: 'slot',
            render: (slot) => {
              return format(new Date(slot.starts_at), 'MM/dd/yyyy')
            },
          },
          { header: 'Status', accessor: 'status' },
          {
            header: 'Chief Complaint',
            accessor: 'encounter',
            render: (encounter) => {
              return encounter?.chief_complaint
            },
          },
        ]}
        data={data || []}
      />

      <TablePagination
        total={total}
        page={page}
        perPage={per_page}
        to={to}
        from={from}
        onPageChange={(q: number) => {
          navigate({
            from: '/patients/$patientId',
            search: { ...search, page: q, perPage: cPp },
          })
        }}
        onPerPageChange={(q: number) => {
          navigate({
            from: '/patients/$patientId',
            search: { ...search, page: cPage, perPage: q },
          })
        }}
      />
    </>
  )
}
