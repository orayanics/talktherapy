import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="px-2 md:p-0 pattern-boxes pattern-color-primary pattern-bg-white pattern-size-8">
      <Outlet />
    </div>
  );
}
