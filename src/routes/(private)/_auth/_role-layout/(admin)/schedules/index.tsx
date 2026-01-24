import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(admin)/schedules/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /schedules</div>;
}
