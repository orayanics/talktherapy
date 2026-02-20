import { createFileRoute } from "@tanstack/react-router";

import AdminContentOverview from "~/views/content/admin/ContentOverview";
import SharedContentOverview from "~/views/content/shared/ContentOverview";

import { useAuthGuard } from "~/hooks/useAuthGuard";

export const Route = createFileRoute("/_private/(shared)/content/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { is } = useAuthGuard();
  const isAdmin = is("admin");

  return isAdmin ? <AdminContentOverview /> : <SharedContentOverview />;
}
