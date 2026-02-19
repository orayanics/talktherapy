import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "~/context/SessionContext";

import AdminOverview from "~/views/schedules/admin/ScheduleOverview";
import ClinicianOverview from "~/views/schedules/clinician/ScheduleOverview";

export const Route = createFileRoute("/_private/(shared)/schedules/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { account_role } = useSession();
  const isClinician = account_role === "clinician";
  return isClinician ? <ClinicianOverview /> : <AdminOverview />;
}
