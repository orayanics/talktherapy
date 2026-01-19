import { createFileRoute } from "@tanstack/react-router";
import NavbarPublic from "~/components/Navbar/NavbarPublic";
import Landing from "~/views/landing";
export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  // this is strictly for a landing page
  return (
    <>
      <NavbarPublic />
      <Landing />
    </>
  );
}
