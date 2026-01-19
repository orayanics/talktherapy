import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/_auth/_role-layout/dashboard")(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  return (
    <div>
      <UserStatsCard />
      <AppointmentStatsCard />
    </div>
  );
}

function UserStatsCard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold">Patient Count</h2>
        <p className="text-2xl">150</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold">Clinician Count</h2>
        <p className="text-2xl">25</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold">Admin Count</h2>
        <p className="text-2xl">5</p>
      </div>
    </div>
  );
}

function AppointmentStatsCard() {
  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
      <p className="text-2xl">45</p>
    </div>
  );
}
