import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DayPicker } from "react-day-picker";

import PageTitle from "~/components/Page/PageTitle";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import { availabilityRulesQuery } from "~/api/scheduling";
import ScheduleCard from "~/modules/schedule/list/ScheduleCard";

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
  return <ScheduleCard item={data} />;
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
        disabled={{ before: new Date() }}
        footer={selected ? `Selected: ${selected}` : "Pick a day."}
      />
    </>
  );
}
