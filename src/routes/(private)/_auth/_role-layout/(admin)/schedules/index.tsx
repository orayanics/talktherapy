import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DayPicker } from "react-day-picker";

import PageTitle from "~/components/Page/PageTitle";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(admin)/schedules/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <PageTitle
        heading="Schedule Overview"
        subheading="View all schedules of clinicians within the system."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={4} className="flex flex-col gap-4 bg-yellow-50">
          <TableClinician />
        </GridItem>

        <GridItem colSpan={4} className="flex flex-col gap-4 ">
          <Calendar />
        </GridItem>

        <GridItem colSpan={4} className="flex flex-col gap-4 bg-red-50">
          <TableSchedule />
        </GridItem>
      </Grid>
    </>
  );
}

const TABLE_LIST = ["John Doe", "Apple John", "Maple John"];
function TableClinician() {
  return (
    <div>
      {TABLE_LIST.map((item) => {
        return <p>{item}</p>;
      })}
    </div>
  );
}

const SCHEDULE_LIST = [
  {
    id: "1",
    clinicianId: "clinician-001",
    day: "Monday",
    startTime: "09:00",
    endTime: "17:00",
    scheduleStatus: "available",
    type: {
      recurrence: "none",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    clinicianId: "clinician-001",
    day: "Tuesday",
    startTime: "10:00",
    endTime: "16:00",
    scheduleStatus: "unavailable",
    type: {
      recurrence: "daily",
      endDate: new Date("2026-02-28"),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    clinicianId: "clinician-002",
    day: "Wednesday",
    startTime: "08:00",
    endTime: "12:00",
    scheduleStatus: "booked",
    type: {
      recurrence: "weekly",
      endDate: new Date("2026-06-30"),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    clinicianId: "clinician-002",
    day: "Thursday",
    startTime: "13:00",
    endTime: "18:00",
    scheduleStatus: "available",
    type: {
      recurrence: "monthly",
      endDate: new Date("2026-12-31"),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function TableSchedule() {
  return (
    <div>
      {SCHEDULE_LIST.map((item) => (
        <div key={item.id} className="mb-4">
          <p>
            <strong>Day:</strong> {item.day}
          </p>
          <p>
            <strong>Time:</strong> {item.startTime} – {item.endTime}
          </p>
          <p>
            <strong>Status:</strong> {item.scheduleStatus}
          </p>
          <p>
            <strong>Recurrence:</strong> {item.type.recurrence}
          </p>

          {item.type.endDate && (
            <p>
              <strong>Ends:</strong> {item.type.endDate.toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function Calendar() {
  const [selected, setSelected] = useState<Date>();
  return (
    <>
      <DayPicker
        className="react-day-picker"
        classNames={{
          months: "w-full max-w-full",
          month_grid: "w-100 mx-auto",
        }}
        mode="single"
        selected={selected}
        onSelect={setSelected}
        footer={
          selected
            ? `Selected: ${selected.toLocaleDateString()}`
            : "Pick a day."
        }
      />
    </>
  );
}
