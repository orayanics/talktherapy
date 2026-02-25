import { formatToLocalDate } from "~/utils/date";
import { ScheduleRecurrenceProps } from "~/models/schedule";

export default function ScheduleRecurrence(props: ScheduleRecurrenceProps) {
  const { recurrenceInfo, date, lastSlot } = props;
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-primary uppercase">Schedule Recurrence</p>
      <div>
        <p>
          Recurring{" "}
          <span className="font-mono text-primary">{recurrenceInfo.freq}</span>
          {recurrenceInfo.byday && recurrenceInfo.byday.length > 0 && (
            <>
              <span> on </span>[
              {recurrenceInfo.byday.map((slot: string, index: number) => (
                <span key={index} className="font-mono text-primary">
                  {slot}
                  {recurrenceInfo.byday &&
                    index < recurrenceInfo.byday.length - 1 &&
                    ","}
                </span>
              ))}
              ]
            </>
          )}
        </p>
        <p>
          Runs from <span className="font-mono text-info">{date}</span> to{" "}
          <span className="font-mono text-info">
            {formatToLocalDate(lastSlot.starts_at)}
          </span>
        </p>
      </div>
    </div>
  );
}
