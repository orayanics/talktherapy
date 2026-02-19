import { useState } from "react";
import { Link } from "@tanstack/react-router";
import PageTitle from "~/components/Page/PageTitle";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";
import { DayPicker } from "react-day-picker";

export default function ScheduleOverview() {
  return (
    <>
      <PageTitle
        heading="Schedule Overview"
        subheading="View all of your schedules within the system."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4 md:col-span-4">
          <Calendar />
          <button className="btn btn-primary">Add New Schedule</button>
        </GridItem>

        <GridItem colSpan={12} className="flex flex-col gap-4 md:col-span-8">
          <TableSchedule />
        </GridItem>
      </Grid>
    </>
  );
}

const TABLE_LIST = [
  "John Doe",
  "Apple John",
  "Maple John",
  "John Doe",
  "Apple John",
  "Maple John",
  "John Doe",
  "Apple John",
  "Maple John",
  "John Doe",
  "Apple John",
  "Maple John",
  "John Doe",
  "Apple John",
  "Maple John",
  "John Doe",
  "Apple John",
  "Maple John",
  "John Doe",
  "Apple John",
  "Maple John",
];

function TableClinician() {
  const handleScrollToSchedule = (e: React.UIEvent<HTMLDivElement>) => {
    const scheduleElement = document.getElementById("table-schedule");
    if (scheduleElement) {
      scheduleElement.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="flex flex-col gap-2 max-h-[88vh] overflow-y-auto">
      {TABLE_LIST.map((item, index) => {
        return (
          <div
            key={index}
            className="p-2 border rounded-lg hover:bg-gray-100 last:border-b-0 hover:cursor-pointer"
            onClick={handleScrollToSchedule}
          >
            {item}
          </div>
        );
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
    createdAt: "2025-01-18T11:10:00Z",
    updatedAt: "2025-01-18T11:10:00Z",
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
      endDate: "2026-02-28",
    },
    createdAt: "2025-01-18T11:10:00Z",
    updatedAt: "2025-01-18T11:10:00Z",
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
      endDate: "2026-06-30",
    },
    createdAt: "2025-01-18T11:10:00Z",
    updatedAt: "2025-01-18T11:10:00Z",
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
      endDate: "2026-12-31",
    },
    createdAt: "2025-01-18T11:10:00Z",
    updatedAt: "2025-01-18T11:10:00Z",
  },
];

function TableSchedule() {
  return (
    <div
      id="table-schedule"
      className="flex flex-col gap-4 max-h-[88vh] overflow-y-auto"
    >
      {SCHEDULE_LIST.map((item) => {
        const { id, day, startTime, endTime, scheduleStatus, type } = item;
        const { recurrence, endDate } = type;
        return (
          <Link
            to="/schedules/$scheduleId"
            params={{
              scheduleId: id,
            }}
            key={id}
            className="flex flex-col gap-2 border rounded-lg p-4 hover:cursor-pointer hover:bg-gray-100"
          >
            <div className="flex flex-row justify-between items-center">
              <p className="font-semibold text-xl">{day}</p>
              <span className="badge">{scheduleStatus}</span>
            </div>
            <p>
              {startTime} – {endTime}
            </p>

            <p className="badge">{recurrence}</p>

            {endDate && <p>Ends on {endDate}</p>}
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
