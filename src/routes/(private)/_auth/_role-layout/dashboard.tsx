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
    <div
      className="grid grid-cols-3 gap-4 [&>div]:bg-white [&>div]:p-4 [&>div]:rounded-md [&>div]:border
    [&>div>h2]:font-semibold  [&>div>h2]:text-lg [&>div>p]:text-2xl
    "
    >
      <div>
        <h2>Patient Count</h2>
        <p>150</p>
      </div>
      <div>
        <h2>Clinician Count</h2>
        <p>25</p>
      </div>
      <div>
        <h2>Admin Count</h2>
        <p>5</p>
      </div>
    </div>
  );
}

function AppointmentStatsCard() {
  return (
    <div className="bg-white p-4 rounded-md mt-4 border">
      <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
      <p className="text-2xl">45</p>
    </div>
  );
}
