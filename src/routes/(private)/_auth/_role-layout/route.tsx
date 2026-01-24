import { createFileRoute, Outlet } from "@tanstack/react-router";
import SidebarSudo from "~/components/Sidebar/SidebarSudo";

export const Route = createFileRoute("/(private)/_auth/_role-layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen bg-white/70 overflow-auto">
      <SidebarSudo>
        <div className="w-full flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </SidebarSudo>
    </div>
  );
}
