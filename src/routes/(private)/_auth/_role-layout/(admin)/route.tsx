import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/_auth/_role-layout/(admin)")({
  component: RouteComponent,
});

function RouteComponent() {
  const isAdmin = true;
  if (!isAdmin) {
    return <div>Access denied. Admin role required.</div>;
  }
  return <Outlet />;
}
