import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/(adm-shared)",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
