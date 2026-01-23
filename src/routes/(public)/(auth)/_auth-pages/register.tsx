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
    <main className="flex items-center container min-h-screen mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mx-auto">
        <div className="my-auto hidden md:flex flex-col justify-center h-100 col-span-6">
          <div className="flex flex-col gap-4 p-6">
            <h1 className="text-4xl font-bold">TalkTherapy</h1>
            <p>
              Speech service in your hands. Skilled doctors, personalized
              exercises and feedback system.
            </p>
            <p>All-in-one go with TalkTherapy!</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center justify-center col-span-6">
          <div className="w-100 border rounded-lg p-6">
            <div className="flex flex-col items-center mb-4">
              <h1 className="text-4xl font-bold mb-4">Get Started</h1>
              <div className="flex gap-4">
                <label className="label">
                  <input
                    className="radio radio-xs radio-info"
                    type="radio"
                    value={1}
                    checked={registerType === 1}
                    onChange={() => setRegisterType(1)}
                  />
                  Patient
                </label>

                <label className="label">
                  <input
                    className="radio radio-xs radio-info"
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
          </div>
        </div>
      </div>
    </main>
  );
}
