import { createFileRoute, Outlet } from "@tanstack/react-router";
import { fetchSession } from "~/api/auth";

export const Route = createFileRoute("/_public")({
  ssr: false,
  loader: async ({ context: { queryClient } }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const session = await queryClient.ensureQueryData({
      queryKey: ["session"],
      queryFn: fetchSession,
    });

    if (session) {
      throw Route.redirect({
        to: "/dashboard",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
