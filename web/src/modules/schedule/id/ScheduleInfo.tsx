import { format } from 'date-fns'
import { parseRRule } from '~/utils/rrule'
import { AvailabilityRuleWithSlots } from '~/models/schedule'

interface ScheduleDetailsIdProps {
  data: AvailabilityRuleWithSlots
}

export default function ScheduleDetailsId(props: ScheduleDetailsIdProps) {
  const { data } = props
  const { starts_at, ends_at, is_active, recurrence_rule, slots } = data

  const start = format(new Date(starts_at), 'pp')
  const end = format(new Date(ends_at), 'pp')
  const lastSlot = slots[slots.length - 1]
  const lastSlotEnd = lastSlot
    ? format(new Date(lastSlot.ends_at), 'PPpp')
    : 'N/A'
  const recurrenceInfo = parseRRule(recurrence_rule)

  return (
    <>
      <div>
        <p className="font-mono uppercase text-primary">Schedule Information</p>
        <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Schedule Frequency</p>
            <p>{recurrenceInfo?.freq ? recurrenceInfo.freq : 'ONE-TIME'}</p>
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

          <div className="flex flex-col gap-2">
            <button className="btn btn-primary">Edit Schedule</button>
            <button className="btn btn-soft btn-error">Delete Schedule</button>
          </div>
        </div>
      </div>
    </>
  )
}
