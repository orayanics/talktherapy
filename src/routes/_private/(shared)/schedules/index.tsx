import { createFileRoute } from "@tanstack/react-router";

import AdminOverview from "~/views/schedules/admin/ScheduleOverview";
import ClinicianOverview from "~/views/schedules/clinician/ScheduleOverview";

export const Route = createFileRoute(
  "/_private/(shared)/schedules/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const role = "clinician";
  return role === "clinician" ? <ClinicianOverview /> : <AdminOverview />;
}
