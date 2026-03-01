import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import useDeleteSchedule from './useDeleteSchedule'
import type { AvailabilityRuleWithSlots } from '~/models/schedule'
import { parseRRule } from '~/utils/rrule'
import ModalConfirm from '~/components/Modal/ModalConfirm'

interface ScheduleDetailsIdProps {
  data: AvailabilityRuleWithSlots
}

export default function ScheduleDetailsId(props: ScheduleDetailsIdProps) {
  const { data } = props
  const { id, starts_at, ends_at, is_active, recurrence_rule, slots } = data

  const start = format(new Date(starts_at), 'pp')
  const end = format(new Date(ends_at), 'pp')
  const lastSlot = slots[slots.length - 1]
  const lastSlotEnd = format(new Date(lastSlot.ends_at), 'PPpp')
  const recurrenceInfo = parseRRule(recurrence_rule)

  const { handleSubmit, isLoading, errors } = useDeleteSchedule({ ruleId: id })
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  return (
    <>
      <div>
        <p className="font-mono uppercase text-primary">Schedule Information</p>
        <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Schedule Frequency</p>
            <p>{recurrenceInfo.freq ? recurrenceInfo.freq : 'ONE-TIME'}</p>
          </div>
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Schedule Start</p>
            <p>{format(new Date(starts_at), 'PPpp')}</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Schedule End</p>
            <p>{lastSlotEnd}</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Schedule Time</p>
            <p>
              {start} - {end}
            </p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Status</p>
            <p>{is_active ? 'Active' : 'Inactive'}</p>
          </div>

          {is_active && (
            <div className="flex flex-col gap-2">
              <button
                className="btn btn-primary"
                onClick={() =>
                  navigate({
                    to: '/schedules/$scheduleId/edit',
                    params: { scheduleId: id },
                  })
                }
              >
                Edit Schedule
              </button>
              <button className="btn btn-soft btn-error" onClick={handleDelete}>
                Delete Schedule
              </button>
            </div>
          )}
        </div>
      </div>
      {showDeleteModal && (
        <ModalConfirm
          title="Delete Schedule"
          description="Are you sure you want to delete this schedule?"
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={async () => {
            await handleSubmit()
          }}
          onCancel={() => setShowDeleteModal(false)}
          states={{ isLoading, errors }}
        />
      )}
    </>
  )
}
