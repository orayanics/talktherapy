import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import SidebarSudo from "~/components/Sidebar/SidebarSudo";

export const Route = createFileRoute("/(private)/_auth/_role-layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <SidebarSudo isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1 overflow-auto p-4">
        <Outlet />
      </div>
    </div>
  );
}
