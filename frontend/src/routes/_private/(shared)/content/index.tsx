import { createFileRoute } from "@tanstack/react-router";

import AdminContentOverview from "~/views/content/admin/ContentOverview";
import SharedContentOverview from "~/views/content/shared/ContentOverview";
export const Route = createFileRoute(
  "/_private/(shared)/content/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const role = "clinician";
  return role !== "clinician" ? (
    <AdminContentOverview />
  ) : (
    <SharedContentOverview />
  );
}
