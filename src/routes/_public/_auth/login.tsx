import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "~/modules/login/LoginForm";

export const Route = createFileRoute("/_public/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container flex items-center min-h-screen mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mx-auto">
        <div className="hidden md:flex flex-col justify-center h-100 col-span-6 bg-white/60 relative">
          <div className="flex flex-col gap-4 p-6">
            <h1 className="text-4xl font-bold">TalkTherapy</h1>
            <p>
              Speech service in your hands. Skilled doctors, personalized
              exercises and feedback system.
            </p>
            <p>All-in-one go with TalkTherapy!</p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2 justify-center col-span-6 px-6">
          <div className="flex flex-col justify-center items-center mx-auto h-full border rounded-lg p-6 bg-white relative">
            <h1 className="text-4xl font-bold mb-4">Login</h1>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
