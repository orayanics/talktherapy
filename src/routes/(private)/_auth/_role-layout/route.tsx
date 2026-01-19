import { createFileRoute, Outlet } from "@tanstack/react-router";
import SidebarSudo from "~/components/Sidebar/SidebarSudo";

export const Route = createFileRoute("/(private)/_auth/_role-layout")({
  component: RouteComponent,
});

function RouteComponent() {
  // for navigation depending on role
  return (
    <div className="grid grid-cols-12 min-h-screen">
      <div className="col-span-1 p-4">
        <SidebarSudo />
      </div>
      <div className="col-span-11 bg-blue-50 p-4">
        <Outlet />
      </div>
    </div>
  );
}
