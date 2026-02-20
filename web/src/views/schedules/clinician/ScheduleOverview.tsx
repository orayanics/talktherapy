import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DayPicker } from "react-day-picker";

import PageTitle from "~/components/Page/PageTitle";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import { availabilityRulesQuery } from "~/api/scheduling";
import { formatToLocalDate, getDay, getTime } from "~/utils/date";

export default function ScheduleOverview() {
  return (
    <>
      <PageTitle
        heading="Schedule Overview"
        subheading="View all of your schedules within the system."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-4">
          <Calendar />
          <Link to="/schedules/create" className="btn btn-primary">
            Add New Schedule
          </Link>
        </GridItem>

        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-8">
          <TableSchedule />
        </GridItem>
      </Grid>
    </>
  );
}

function TableSchedule() {
  const { data = [], isLoading, error } = useQuery(availabilityRulesQuery());
  console.log(data);
  return (
    <div
      id="table-schedule"
      className="flex flex-col gap-4 max-h-[88vh] overflow-y-auto"
    >
      {data.map((item: any) => {
        const { id, starts_at, ends_at, is_active, recurrence_rule } = item;
        const day = getDay(starts_at);
        const date = formatToLocalDate(starts_at);
        const start = getTime(starts_at);
        const end = getTime(ends_at);
        return (
          <Link
            to="/schedules/$scheduleId"
            params={{ scheduleId: id }}
            key={id}
            className="flex flex-col gap-2 border rounded-lg p-4 hover:cursor-pointer hover:bg-gray-100"
          >
            <div className="flex flex-row justify-between items-center">
              <p className="font-semibold text-xl">{day}</p>
              <p className="font-semibold text-xl">{date}</p>
              <span className="badge">{is_active ? "Active" : "Inactive"}</span>
            </div>

            <p>
              {start} – {end}
            </p>

            {recurrence_rule && <p className="badge">{recurrence_rule}</p>}
          </Link>
        );
      })}
    </div>
  );
}

function Calendar() {
  const [selected, setSelected] = useState<Date>();
  return (
    <>
      <DayPicker
        className="react-day-picker bg-white"
        classNames={{
          months: "w-full max-w-full",
          month_grid: "w-100 mx-auto",
          day_button:
            "px-3 py-3 rounded-lg hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-blue-50 focus:text-blue-800 focus:border-blue-200",
          today: "font-bold text-blue-800",
        }}
        mode="single"
        selected={selected || undefined}
        onSelect={setSelected}
        footer={selected ? `Selected: ${selected}` : "Pick a day."}
      />
    </>
  );
}
