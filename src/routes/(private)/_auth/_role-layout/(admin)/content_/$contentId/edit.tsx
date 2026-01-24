import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(admin)/content_/$contentId/edit",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /content/$contentId/edit</div>;
}
