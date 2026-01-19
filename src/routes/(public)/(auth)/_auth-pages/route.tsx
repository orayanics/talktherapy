import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/(auth)/_auth-pages")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}
