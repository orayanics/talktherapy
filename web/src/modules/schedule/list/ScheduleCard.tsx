import { useState } from "react";
import { formatToLocalDate, getDay, getTime } from "~/utils/date";
import { parseRRule } from "~/utils/rrule";
import ScheduleRecurrence from "./ScheduleRecurrence";
interface ScheduleCardProps {
  item: any;
}

export default function ScheduleCard(props: ScheduleCardProps) {
  const { item } = props;
  const [current, setCurrent] = useState<string>(item?.id || "");

  return (
    <div
      id="table-schedule"
      className="flex flex-col gap-4 max-h-[88vh] overflow-y-auto"
    >
      {item.map((item: any) => {
        const { id, starts_at, recurrence_rule, slots } = item;
        const day = getDay(starts_at);
        const date = formatToLocalDate(starts_at);
        const lastSlot = slots[slots.length - 1];
        const recurrenceInfo = parseRRule(recurrence_rule);

        const recurrenceProps = {
          recurrenceInfo,
          date,
          lastSlot,
        };

        return (
          <div
            className="collapse collapse-plus bg-base-100 border border-base-300"
            key={id}
          >
            <input
              type="radio"
              name={`accordion-${id}`}
              onChange={() => setCurrent(id)}
              checked={current === id || false}
            />
            <div className="collapse-title">
              <div className="flex flex-row gap-4 items-center">
                <span className="text-primary">*</span>
                <p className="">{day}</p>
                <p className="">{date}</p>
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
                    <p className="text-xs text-gray-400">
                      These are the time slots available for this schedule.
                    </p>
                  </div>

                  {slots.map((slot: any) => {
                    const slotStart = getTime(slot.starts_at);
                    const slotEnd = getTime(slot.ends_at);
                    const slotDate = formatToLocalDate(slot.starts_at);
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
                          className={`font-mono badge badge-ghost ${slot.is_booked ? "badge-error" : "badge-success"}`}
                        >
                          {slot.is_booked ? "Booked" : "Available"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
