import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import RegisterClinician from "~/modules/register/RegisterClinician";
import RegisterPatient from "~/modules/register/RegisterPatient";

import { useGetPublicDiagnoses } from "~/api/public";

export const Route = createFileRoute("/_public/_auth/register")({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(useGetPublicDiagnoses);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const publicDiagnoses = Route.useLoaderData();
  const [registerType, setRegisterType] = useState(0);
  const showRegister =
    registerType === 0 ? (
      <RegisterPatient data={publicDiagnoses} />
    ) : (
      <RegisterClinician />
    );

  return (
    <div className="flex items-center container min-h-screen lg:max-h-1 mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mx-auto">
        <div className="my-auto hidden lg:flex flex-col justify-center h-100 col-span-1 bg-radial-fade relative">
          <div className=" [&>p]:text-gray-500 [&>p]:text-lg">
            <h1 className="font-mono text-7xl font-bold bg-linear-to-r from-primary via-sky-500 to-blue-400 bg-clip-text text-transparent">
              TalkTherapy
            </h1>
            <p>
              Speech service in your hands. Skilled doctors, personalized
              exercises and feedback system. All-in-one go with TalkTherapy!
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center justify-center col-span-1">
          <div className="h-full max-h-[90vh] overflow-auto w-auto lg:w-100 border rounded-lg p-6 bg-white relative shadow-lg/10">
            <div className="flex flex-col items-center mb-4">
              <h1 className="text-4xl font-bold mb-4">Get Started</h1>
              <div className="flex gap-4">
                <label className="label">
                  <input
                    className="radio radio-xs radio-primary"
                    type="radio"
                    value={0}
                    checked={registerType === 0}
                    onChange={() => setRegisterType(0)}
                  />
                  Patient
                </label>

                <label className="label">
                  <input
                    className="radio radio-xs radio-primary"
                    type="radio"
                    value={1}
                    checked={registerType === 1}
                    onChange={() => setRegisterType(1)}
                  />
                  Clinician
                </label>
              </div>
            </div>
            {showRegister}
          </div>
        </div>
      </div>
    </div>
  );
}
