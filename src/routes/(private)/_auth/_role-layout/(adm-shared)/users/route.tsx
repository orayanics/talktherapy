import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(adm-shared)/users",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const isSudo = true;

  if (!isSudo) {
    return <div>Access denied. Sudo role required.</div>;
  }
  return <Outlet />;
}
