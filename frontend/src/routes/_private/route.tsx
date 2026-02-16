import { createFileRoute, Outlet } from "@tanstack/react-router";
import { fetchSession } from "~/api/auth";
import { SessionProvider } from "~/context/SessionContext";
import Sidebar from "~/components/Sidebar/Sidebar";

export const Route = createFileRoute("/_private")({
  ssr: false,
  loader: async ({ context: { queryClient } }) => {
    try {
      const session = await queryClient.ensureQueryData({
        queryKey: ["session"],
        queryFn: fetchSession,
      });

      if (!session) throw new Error("No session");

      return session;
    } catch (err) {
      throw Route.redirect({
        to: "/login",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const session = Route.useLoaderData();
  const { account_role } = session;
  return (
    <SessionProvider value={session}>
      <div className="flex bg-white/70">
        <Sidebar role={account_role as any}>
          <div className="w-full flex-1 overflow-auto min-h-screen p-4">
            <Outlet />
          </div>
        </Sidebar>
      </div>
    </SessionProvider>
  );
}
