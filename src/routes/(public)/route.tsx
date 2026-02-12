import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)")({
  component: RouteComponent,
});

function RouteComponent() {
  const isAuth = true;

  if (!isAuth) {
    return <div>You are already logged in.</div>;
  }

  return <Outlet />;
}
