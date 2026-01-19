import { createFileRoute, Outlet } from "@tanstack/react-router";
import NavbarPublic from "~/components/Navbar/NavbarPublic";

export const Route = createFileRoute("/(public)")({
  component: RouteComponent,
});

function RouteComponent() {
  const isAuth = true;

  if (!isAuth) {
    return <div>You are already logged in.</div>;
  }

  return (
    <>
      <NavbarPublic />
      <Outlet />
    </>
  );
}
