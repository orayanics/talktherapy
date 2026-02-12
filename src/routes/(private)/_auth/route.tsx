import { createFileRoute, Outlet } from "@tanstack/react-router";
import { fetchSession } from "~/api/auth";
import { SessionProvider } from "~/context/SessionContext";

export const Route = createFileRoute("/(private)/_auth")({
  ssr: false,
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData({
      queryKey: ["session"],
      queryFn: fetchSession,
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const session = Route.useLoaderData();

  return (
    <SessionProvider value={session}>
      <Outlet />
    </SessionProvider>
  );
}
