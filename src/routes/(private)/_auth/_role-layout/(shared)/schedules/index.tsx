import { createFileRoute } from "@tanstack/react-router";

import AdminOverview from "~/views/schedules/admin/ScheduleOverview";
import ClinicianOverview from "~/views/schedules/clinician/ScheduleOverview";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(shared)/schedules/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const role = "clinician";
  return role === "clinician" ? <ClinicianOverview /> : <AdminOverview />;
}
