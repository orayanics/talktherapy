import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(clinician)"
)({
  component: RouteComponent,
});

function RouteComponent() {
  // TODO: Role check
  return <Outlet />;
}
