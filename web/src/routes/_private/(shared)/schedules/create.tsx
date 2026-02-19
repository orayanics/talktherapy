import { createFileRoute } from "@tanstack/react-router";
import ScheduleForm from "~/modules/schedule/ScheduleForm";

export const Route = createFileRoute("/_private/(shared)/schedules/create")({
  component: RouteComponent,
});

// ── Component ────────────────────────────────────────────────────────────────

function RouteComponent() {
  return <ScheduleForm />;
}
