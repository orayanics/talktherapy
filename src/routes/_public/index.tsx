import { createFileRoute } from "@tanstack/react-router";
import Landing from "~/views/landing";

export const Route = createFileRoute("/_public/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Landing />;
}
