import { createFileRoute } from "@tanstack/react-router";

import AdminContentView from "~/views/content/admin/ContentView";
import SharedContentView from "~/views/content/shared/ContentView";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(shared)/content/$contentId"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const role = "clinician";
  return role !== "clinician" ? <AdminContentView /> : <SharedContentView />;
}
