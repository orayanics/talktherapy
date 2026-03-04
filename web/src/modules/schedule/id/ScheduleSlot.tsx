import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import useDeleteSlot from './useDeleteSlot'
import type { SlotDto } from '~/models/booking'
import type {
  ScheduleSlotItemProps,
  ScheduleSlotProps,
} from '~/models/components'
import ModalConfirm from '~/components/Modal/ModalConfirm'
import { useAuthGuard } from '~/hooks/useAuthGuard'

function ScheduleSlotItem({ is_active, slot, ruleId }: ScheduleSlotItemProps) {
  const { id, starts_at, ends_at, status } = slot
  const { handleSubmit, isLoading, errors } = useDeleteSlot({
    slotId: id,
    ruleId,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { is } = useAuthGuard()
  const isClinician = is('clinician')

  return (
    <>
      <div className="flex flex-row justify-between gap-2">
        <Link
          to={'/slots/$slotId'}
          params={{ slotId: id }}
          className="flex flex-row gap-4"
        >
          <p>
            {new Date(starts_at).toLocaleTimeString()} -{' '}
            {new Date(ends_at).toLocaleTimeString()}
          </p>
          <p className="badge badge-soft">{status}</p>
        </Link>
        {is_active && isClinician && (
          <button
            className="btn btn-soft btn-error"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </button>
        )}
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
  const { is_active } = data
  const slots: Array<SlotDto> = data.slots

  const slotProps = {
    is_active,
    slots,
    ruleId: data.id,
  }

  return (
    <div>
      <p className="font-mono uppercase text-primary">Schedule Slots</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        {slots.map((slot) => (
          <ScheduleSlotItem key={slot.id} {...slotProps} slot={slot} />
        ))}
      </div>
    </div>
  )
}
