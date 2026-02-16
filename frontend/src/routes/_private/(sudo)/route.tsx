import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/(sudo)")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
