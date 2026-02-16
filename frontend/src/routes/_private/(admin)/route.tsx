import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/(admin)")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
