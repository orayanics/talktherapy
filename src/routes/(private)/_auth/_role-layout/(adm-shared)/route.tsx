import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(adm-shared)",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const isAllowed = true; // for sudo and admin only
  if (!isAllowed) {
    return <div>Access Denied</div>;
  }
  return <Outlet />;
}
