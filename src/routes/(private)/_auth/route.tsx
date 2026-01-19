import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  // can be used for auth checks
  const isAuth = true;

  if (!isAuth) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}
