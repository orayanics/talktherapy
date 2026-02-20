import { createFileRoute, Outlet } from "@tanstack/react-router";
import { sessionQueryOptions } from "~/api/auth";

export const Route = createFileRoute("/_public")({
  ssr: false,
  loader: async ({ context: { queryClient } }) => {
    const session =
      localStorage.getItem("talktherapy_session") &&
      (await queryClient.ensureQueryData(sessionQueryOptions));
    if (session) {
      throw Route.redirect({ to: "/dashboard" });
    }
    return null;
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
