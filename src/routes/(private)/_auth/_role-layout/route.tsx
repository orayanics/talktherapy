import { createFileRoute, Outlet } from "@tanstack/react-router";
import Sidebar from "~/components/Sidebar/Sidebar";

export const Route = createFileRoute("/(private)/_auth/_role-layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const userRole = "admin";
  return (
    <div className="flex bg-white/70">
      <Sidebar role={userRole}>
        <div className="w-full flex-1 overflow-auto min-h-screen p-4">
          <Outlet />
        </div>
      </Sidebar>
    </div>
  );
}
