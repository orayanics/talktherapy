import { Outlet, createFileRoute } from "@tanstack/react-router";
import { requireRole } from "~/utils/auth-guard";
import { sessionQueryOptions } from "~/api/auth";

export const Route = createFileRoute("/_private/(clinician)")({
  ssr: false,
  loader: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(sessionQueryOptions);
    return requireRole(session, "clinician");
  },
  component: () => <Outlet />,
});
