import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import ScheduleRecurrence from './ScheduleRecurrence'
import type { ScheduleCardProps } from '~/models/components'
import { parseRRule } from '~/utils/rrule'
import { formatToLocalDate, getDay, getTime } from '~/utils/date'

export default function ScheduleCard(props: ScheduleCardProps) {
  const { data } = props
  const [current, setCurrent] = useState<string>(data[0]?.id || '')
  return (
    <div
      id="table-schedule"
      className="space-y-2 min-h-[70vh] max-h-[70vh] overflow-y-auto"
    >
      {data.map((item: any) => {
        const { id, starts_at, recurrence_rule, slots } = item
        const day = getDay(starts_at)
        const date = formatToLocalDate(starts_at)
        const lastSlot = slots[slots.length - 1]
        const recurrenceInfo = parseRRule(recurrence_rule)

        const recurrenceProps = {
          recurrenceInfo,
          date,
          lastSlot,
        }

        return (
          <div
            className={`${current === id && 'border-primary'} collapse collapse-plus bg-base-100 border border-base-300`}
            key={id}
            id={`schedule-${id}`}
          >
            <input
              type="checkbox"
              name={`accordion-${id}`}
              onChange={() => {
                setCurrent(current === id ? '' : id)
              }}
              checked={current === id}
              className="p-0"
            />
            <div className="collapse-title">
              <div className="flex flex-row gap-4 items-center">
                <span className="text-primary">*</span>
                <Link
                  to={'/schedules/$scheduleId'}
                  params={{
                    scheduleId: id,
                  }}
                  className="flex flex-row gap-4 z-1 hover:text-primary"
                >
                  <p className="">{day}</p>
                  <p className="">{date}</p>
                </Link>
              </div>
            </div>

            <div className="collapse-content flex flex-col gap-2">
              {slots.length > 0 && (
                <div className="flex flex-col gap-2">
                  {recurrence_rule && (
                    <>
                      <ScheduleRecurrence {...recurrenceProps} />
                      <hr />
                    </>
                  )}

                  <div>
                    <h4 className="font-mono text-primary">TIME SCHEDULE</h4>
                    <p className="text-sm text-gray-400">
                      These are the time slots available for this schedule.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {slots.map((slot: any) => {
                      const slotStart = getTime(slot.starts_at)
                      const slotEnd = getTime(slot.ends_at)
                      const slotDate = formatToLocalDate(slot.starts_at)
                      return (
                        <div
                          key={slot.id}
                          className="flex flex-row justify-between items-center border rounded-lg p-2 hover:bg-gray-50"
                        >
                          <div className="flex gap-2 justify-between">
                            <p className="text-sm border-r pr-3 w-24">
                              {slotDate}
                            </p>
                            <p className="text-sm pl-3">
                              {slotStart} – {slotEnd}
                            </p>
                          </div>
                          <span
                            className={`font-mono badge badge-ghost ${slot.status ? 'badge-error' : 'badge-success'}`}
                          >
                            {slot.status}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
