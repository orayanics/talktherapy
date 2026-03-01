import { useState } from 'react'
import useDeleteSlot from './useDeleteSlot'
import type { AvailabilityRuleWithSlots, SlotDto } from '~/models/schedule'
import ModalConfirm from '~/components/Modal/ModalConfirm'

interface ScheduleSlotProps {
  data: AvailabilityRuleWithSlots
}

function ScheduleSlotItem({ slot, ruleId }: { slot: SlotDto; ruleId: string }) {
  const { id, starts_at, ends_at, status } = slot
  const { handleSubmit, isLoading, errors } = useDeleteSlot({
    slotId: id,
    ruleId,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <>
      <div className="flex flex-row justify-between gap-2">
        <div className="flex flex-row gap-4">
          <p>
            {new Date(starts_at).toLocaleTimeString()} -{' '}
            {new Date(ends_at).toLocaleTimeString()}
          </p>
          <p className="badge badge-soft">{status}</p>
        </div>
        <button
          className="btn btn-soft btn-error"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete
        </button>
      </div>
      {showDeleteModal && (
        <ModalConfirm
          title="Delete Slot"
          description="Are you sure you want to delete this slot?"
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={async () => {
            const success = await handleSubmit()
            if (success) setShowDeleteModal(false)
          }}
          onCancel={() => setShowDeleteModal(false)}
          states={{ isLoading, errors }}
        />
      )}
    </>
  )
}

export default function ScheduleSlot(props: ScheduleSlotProps) {
  const { data } = props
  const slots: Array<SlotDto> = data.slots

  return (
    <div>
      <p className="font-mono uppercase text-primary">Schedule Slots</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        {slots.map((slot) => (
          <ScheduleSlotItem key={slot.id} slot={slot} ruleId={data.id} />
        ))}
      </div>
    </div>
  )
}
