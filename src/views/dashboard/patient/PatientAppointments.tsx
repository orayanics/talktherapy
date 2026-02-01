import { AppointmentStatus } from "~/models/content";

import AppointmentStatusBadge from "~/components/Badge/AppointmentStatusBadge";
export default function PatientAppointments() {
  const SAMPLE_APPOINTMENTS = [
    {
      id: 1,
      date: "2024-07-01",
      startTime: "10:00 AM",
      endTime: "10:30 AM",
      status: "completed",
      clinician: "Dr. Smith",
    },
    {
      id: 2,
      date: "2024-07-02",
      startTime: "11:00 AM",
      endTime: "11:30 AM",
      status: "pending",
      clinician: "Dr. Johnson",
    },
    {
      id: 3,
      date: "2024-07-03",
      startTime: "09:00 AM",
      endTime: "09:45 AM",
      status: "accepted",
      clinician: "Dr. Brown",
    },
    {
      id: 4,
      date: "2024-07-04",
      startTime: "02:00 PM",
      endTime: "02:30 PM",
      status: "requested",
      clinician: "Dr. Taylor",
    },
    {
      id: 5,
      date: "2024-07-05",
      startTime: "01:00 PM",
      endTime: "01:30 PM",
      status: "rescheduled",
      clinician: "Dr. Wilson",
    },
    {
      id: 6,
      date: "2024-07-06",
      startTime: "03:00 PM",
      endTime: "03:30 PM",
      status: "rejected",
      clinician: "Dr. Martinez",
    },
  ];
  return (
    <div className="flex flex-col gap-2 [&>div]:border-b [&>div]:last:border-b-0">
      {SAMPLE_APPOINTMENTS.map((appointment) => {
        const { id, date, startTime, endTime, status, clinician } = appointment;
        return (
          <div
            key={id}
            className="flex flex-col md:flex-row gap-2 justify-between py-2"
          >
            <div className="flex flex-col">
              <div className="flex justify-between items-center gap-2 mb-2">
                <p className="font-bold">{date}</p>
                <AppointmentStatusBadge status={status as AppointmentStatus} />
              </div>
              <p>
                {startTime} - {endTime}
              </p>
              <p>{clinician}</p>
            </div>

            <div className="flex gap-2 justify-end">
              <button className="btn btn-primary">View</button>{" "}
              <button className="btn btn-primary">Cancel</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
