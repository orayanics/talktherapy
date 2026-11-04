import { useQuery } from '@tanstack/react-query'
import Drawer from '#/components/Drawer'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import { Row } from '#/components/Table/Row'
import AppointmentPill from '#/modules/appointments/components/AppointmentPill'
import { CircleCheck, CircleX } from 'lucide-react'
import { formatDate } from '#/utils/useDate'
import { fetchSlot } from '#/modules/schedules/api/schedules'

export default function SlotDetailsDrawer({
  slotId,
  onClose,
}: {
  slotId: string | null
  onClose: () => void
}) {
  const query = useQuery({
    ...fetchSlot(slotId ?? ''),
    enabled: Boolean(slotId),
  })
  const slot = query.data

  return (
    <Drawer
      isOpen={Boolean(slotId)}
      onClose={onClose}
      label="Time slot details"
      title="Time Slot Details"
      className={slotId ? 'fixed inset-0 z-40' : 'hidden'}
      panelClassName="min-h-full w-full max-w-md overflow-y-auto bg-base-100 text-base-content"
    >
      {query.isPending ? (
        <StateLoading />
      ) : query.isError || !slot ? (
        <StateError />
      ) : (
        <div className="space-y-2 p-6">
          <Row label="Start At (UTC)" value={formatDate(slot.start_at, 'p')} />
          <Row label="End At (UTC)" value={formatDate(slot.end_at, 'p')} />
          <Row
            label="Status"
            value={<AppointmentPill status={slot.status} />}
          />
          <Row
            label="Is Hidden"
            value={
              slot.is_hidden ? (
                <CircleCheck className="text-emerald-600" />
              ) : (
                <CircleX className="text-rose-600" />
              )
            }
          />
        </div>
      )}
    </Drawer>
  )
}
