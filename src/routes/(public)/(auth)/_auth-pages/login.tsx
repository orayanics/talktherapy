import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "~/modules/login/LoginForm";

export const Route = createFileRoute("/(public)/(auth)/_auth-pages/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto">
      <LoginForm />
    </div>
  );
}
