import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/(auth)/_auth-pages")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="px-2 md:p-0 pattern-boxes pattern-color-primary pattern-bg-white pattern-size-8">
      <Outlet />
    </main>
  );
}
