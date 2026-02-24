import { useState } from "react";
import { getTime } from "~/utils/date";

interface AppointmentCardProps {
  data: any;
}

export default function AppointmentCard(props: AppointmentCardProps) {
  const { data } = props;
  const [current, setCurrent] = useState<string>(data[0]?.id || "");
  return (
    <div
      id="slot-list"
      className="flex flex-col gap-4 max-h-[88vh] overflow-y-auto"
    >
      {data.map((item: any) => {
        const { id, starts_at, ends_at, clinician } = item;
        const startTime = getTime(starts_at);
        const endTime = getTime(ends_at);
        const {
          user: { name },
          diagnosis: { label },
        } = clinician;

        return (
          <div
            key={id}
            className="collapse collapse-plus bg-base-100 border border-base-300"
          >
            <input
              type="radio"
              name={`accordion-${id}`}
              checked={current === id}
              onChange={() => setCurrent(id)}
            />
            <div className="collapse-title">
              <div className="flex flex-row gap-4 items-center">
                <button
                  type="button"
                  className="btn btn-sm btn-primary relative z-1"
                >
                  Book
                </button>
                <p className="badge badge-soft">{label}</p>
                <p className="ml-auto text-sm text-gray-500">
                  {startTime} – {endTime}
                </p>
              </div>
            </div>
            <div className="collapse-content flex flex-col gap-2 text-sm text-gray-600">
              <div>
                <p className="font-mono text-primary">Clinician</p>
                <p>{name}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
