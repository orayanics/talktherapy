import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/_auth/_role-layout/(sudo)")({
  component: RouteComponent,
});

function RouteComponent() {
  const isSudo = true;

  if (!isSudo) {
    return <div>Access denied. Sudo role required.</div>;
  }
  return <div>Hello "/(private)/_auth/_role-layout/(sudo)"!</div>;
}
