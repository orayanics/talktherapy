import { createFileRoute } from "@tanstack/react-router";

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

export const Route = createFileRoute("/(private)/_auth/_role-layout/dashboard")(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  return (
    <Grid cols={12} gap={2}>
      <h1 className="text-lg font-semibold">Overview</h1>
      <GridItem colSpan={12} className="flex flex-col gap-4">
        <UserStatsCard />
        <AppointmentStatsCard />
      </GridItem>
    </Grid>
  );
}

function UserStatsCard() {
  return (
    <Grid
      cols={12}
      gap={4}
      className=" rounded-lg [&>div]:bg-white [&>div]:p-4 [&>div]:rounded-lg [&>div]:border
    [&>div>h2]:font-medium [&>div>h2]:text-gray-600 [&>div>p]:text-2xl [&>div>p]:font-semibold"
    >
      <GridItem colSpan={12} className="md:col-span-3">
        <h2>Patient Count</h2>
        <p>150</p>
      </GridItem>
      <GridItem colSpan={12} className="md:col-span-3">
        <h2>Clinician Count</h2>
        <p>25</p>
      </GridItem>
      <GridItem colSpan={12} className="md:col-span-3">
        <h2>Admin Count</h2>
        <p>5</p>
      </GridItem>
      <GridItem colSpan={12} className="md:col-span-3 order-first md:order-0">
        <h2>Total Users</h2>
        <p>180</p>
      </GridItem>
    </Grid>
  );
}

function AppointmentStatsCard() {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h2 className="font-medium text-gray-600">Upcoming Appointments</h2>
      <p className="text-2xl font-semibold">45</p>
    </div>
  );
}
