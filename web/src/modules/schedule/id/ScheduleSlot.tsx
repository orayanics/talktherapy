import type { AvailabilityRuleWithSlots, SlotDto } from '~/models/schedule'

interface ScheduleSlotProps {
  data: AvailabilityRuleWithSlots
}

export default function ScheduleSlot(props: ScheduleSlotProps) {
  const { data } = props
  const slots: Array<SlotDto> = data.slots

  return (
    <>
      <div>
        <p className="font-mono uppercase text-primary">Schedule Slots</p>
        <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
          {slots.map((slot: SlotDto) => {
            const { starts_at, ends_at, status } = slot
            return (
              <div
                key={slot.id}
                className="flex flex-row justify-between gap-2"
              >
                <p className="font-bold">Slot Time</p>
                <p>
                  {new Date(starts_at).toLocaleTimeString()} -{' '}
                  {new Date(ends_at).toLocaleTimeString()}
                </p>
                <p className="badge badge-soft">{status}</p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
