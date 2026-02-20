import { createFileRoute } from "@tanstack/react-router";

import AdminOverview from "~/views/schedules/admin/ScheduleOverview";
import ClinicianOverview from "~/views/schedules/clinician/ScheduleOverview";

import { useAuthGuard } from "~/hooks/useAuthGuard";
export const Route = createFileRoute("/_private/(shared)/schedules/")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const { is } = useAuthGuard();
  const isAdmin = is("admin");
  const isClinician = is("clinician");
  const isAllowed = isAdmin || isClinician;

  if (!isAllowed) {
    throw new Error("Unauthorized");
  }

  return isAdmin ? <AdminOverview /> : <ClinicianOverview />;
}
