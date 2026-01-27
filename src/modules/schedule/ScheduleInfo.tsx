import { Link } from "@tanstack/react-router";

export default function ScheduleInfo() {
  return (
    <>
      <div>
        <p className="font-bold uppercase text-info">Schedule Information</p>
        <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Assigned Clinician</p>
            <p>Dr. Smith</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Schedule Date</p>
            <p>01/01/2024</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Schedule Time</p>
            <p>10:00 AM - 11:00 AM</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Status</p>
            <p>Available</p>
          </div>

          <div className="flex flex-col gap-2">
            <button className="btn btn-soft btn-info">Edit Schedule</button>
            <button className="btn btn-soft btn-error">Delete Schedule</button>
          </div>
        </div>
      </div>
    </>
  );
}
