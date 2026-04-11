import { fetchSlot } from '@/api/schedule'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import StateError from '@/components/State/StateError'
import StateLoading from '@/components/State/StateLoading'
import { Row } from '@/components/Table/Row'
import { ArrowLeft, CircleCheck, CircleX } from 'lucide-react'
import { formatDate } from '@/utils/useDate'
import AppointmentPill from '@/components/Decorator/AppointmentPill'

export const Route = createFileRoute('/_private/(clinician)/schedules/$slotId')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  const { slotId } = Route.useParams()
  const { data, isPending, isError } = useQuery(fetchSlot(slotId))

  return (
    <>
      {isPending ? (
        <StateLoading />
      ) : isError ? (
        <StateError />
      ) : (
        <div className="space-y-6">
          <Link
            to="/schedules"
            className="flex gap-2 items-center link link-hover text-slate-600"
          >
            <ArrowLeft size={16} />
            Schedules
          </Link>

          <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6 space-y-2">
            <h1 className="text-xl font-bold pb-2 mb-2 border-b border-slate-300">
              Time Slot Details
            </h1>
            <Row label="Start At" value={formatDate(data.start_at, 'p')} />
            <Row label="End At" value={formatDate(data.end_at, 'p')} />
            <Row
              label="Status"
              value={<AppointmentPill status={data.status} />}
            />
            <Row
              label="Is Hidden"
              value={
                data.is_hidden ? (
                  <CircleCheck className="text-emerald-600" />
                ) : (
                  <CircleX className="text-rose-600" />
                )
              }
            />
          </div>
        </div>
      )}
    </>
  )
}
