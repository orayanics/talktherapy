import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(adm-shared)/users_/$userId/edit",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello users/$userId/edit</div>;
}
