import { createFileRoute } from "@tanstack/react-router";
import Landing from "~/views/landing";
export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <Landing />;
}
