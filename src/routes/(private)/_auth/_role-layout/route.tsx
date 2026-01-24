import { createFileRoute, Outlet } from "@tanstack/react-router";
import Sidebar from "~/components/Sidebar/Sidebar";

export const Route = createFileRoute("/(private)/_auth/_role-layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const userRole = "admin";
  return (
    <div className="flex h-screen bg-white/70 overflow-auto">
      <Sidebar role={userRole}>
        <div className="w-full flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </Sidebar>
    </div>
  );
}
