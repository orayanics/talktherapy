import { createFileRoute } from "@tanstack/react-router";

import PageTitle from "~/components/Page/PageTitle";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import AppointmentInfo from "~/modules/appointment/AppointmentInfo";
export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(patient)/appointments/$appointmentId"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <PageTitle
        heading="Appointment Overview"
        subheading="View appointment details and information."
      />

      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4 md:col-span-6">
          <AppointmentInfo />
        </GridItem>
      </Grid>
    </>
  );
}
