import { createFileRoute, Outlet } from "@tanstack/react-router";
import { fetchSession } from "~/api/auth/auth";

export const Route = createFileRoute("/(private)/_auth")({
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
  const { accountStatus, userType } = session;

  return (
    <div>
      <p>{accountStatus}</p>
      <p>{userType}</p>
      <Outlet />
    </div>
  );
}
