import { createFileRoute, Outlet } from "@tanstack/react-router";
import Sidebar from "~/components/Sidebar/Sidebar";
import { useSession } from "~/context/SessionContext";

export const Route = createFileRoute("/(private)/_auth/_role-layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const session = useSession();
  const { account_role } = session;
  return (
    <div className="flex bg-white/70">
      <Sidebar role={account_role as any}>
        <div className="w-full flex-1 overflow-auto min-h-screen p-4">
          <Outlet />
        </div>
      </Sidebar>
    </div>
  );
}
