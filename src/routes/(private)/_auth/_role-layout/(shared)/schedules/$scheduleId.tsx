import { createFileRoute } from "@tanstack/react-router";

import PageTitle from "~/components/Page/PageTitle";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import ScheduleInfo from "~/modules/schedule/ScheduleInfo";
import ScheduleAppointmentInfo from "~/modules/schedule/ScheduleAppointmentInfo";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(shared)/schedules/$scheduleId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <PageTitle
        heading="Schedule Overview"
        subheading="View schedule details and appointment information."
      />

      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4 md:col-span-6">
          <ScheduleInfo />
        </GridItem>

        <GridItem colSpan={12} className="flex flex-col gap-4 md:col-span-6">
          <ScheduleAppointmentInfo />
        </GridItem>
      </Grid>
    </>
  );
}
