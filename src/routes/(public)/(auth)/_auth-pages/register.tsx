import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import RegisterClinician from "~/modules/register/RegisterClinician";
import RegisterPatient from "~/modules/register/RegisterPatient";

export const Route = createFileRoute("/(public)/(auth)/_auth-pages/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const [registerType, setRegisterType] = useState(1);

  return (
    <main className="w-full">
      <div className="flex flex-col items-center justify-center">
        <h1>Get Started</h1>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              value={1}
              checked={registerType === 1}
              onChange={() => setRegisterType(1)}
            />
            Patient
          </label>

          <label>
            <input
              type="radio"
              value={0}
              checked={registerType === 0}
              onChange={() => setRegisterType(0)}
            />
            Clinician
          </label>
        </div>
      </div>
      {registerType === 0 ? <RegisterClinician /> : <RegisterPatient />}
    </main>
  );
}
