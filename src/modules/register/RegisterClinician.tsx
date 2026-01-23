import { useState } from "react";

export default function RegisterClinician() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleVerification() {
    // async simulation
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsVerified(true);
  }

  return (
    <div className="container mx-auto">
      {isVerified ? <ClinicianForm /> : <ClinicianVerification />}

      <button
        className="btn btn-primary w-full mt-4"
        onClick={handleVerification}
        disabled={isLoading || isVerified}
      >
        Simulate Verification
      </button>
    </div>
  );
}

function ClinicianVerification() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-semibold">Clinician Verification</h1>
      <p>Please enter the 6-digit verification code sent to your email.</p>
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            className="input w-12 text-center text-xl"
          />
        ))}
      </div>
    </div>
  );
}

function ClinicianForm() {
  return (
    <form
      onSubmit={() => {
        alert("submit");
      }}
      className="flex flex-col gap-5"
    >
      <ClinicianPersonalForm />
      <ClinicianAccountForm />
      <button className="btn btn-primary mt-4">Submit</button>
    </form>
  );
}

function ClinicianPersonalForm() {
  const SPECIALTY_OPTIONS = [
    "Psychologist",
    "Psychiatrist",
    "Therapist",
    "Counselor",
    "Social Worker",
    "Other",
  ];
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-semibold">Personal Information</h1>
      <div className="flex flex-col gap-4">
        <div className="grid md:grid-cols-2 grid-cols-1 grid-rows-1 gap-4 [&>input]:w-full">
          <input className="input" type="text" placeholder="First Name" />
          <input className="input" type="text" placeholder="Last Name" />
        </div>

        <div className="flex flex-col gap-4 [&>select]:w-full">
          <select className="input" defaultValue="">
            <option value="" disabled>
              Select Specialty
            </option>
            {SPECIALTY_OPTIONS.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function ClinicianAccountForm() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-semibold">Account</h1>
      <div className="flex flex-col gap-4 [&>input]:w-full">
        <input className="input" type="text" placeholder="Username" />
        <input className="input" type="email" placeholder="Email" />
        <input className="input" type="password" placeholder="Password" />
        <input
          className="input"
          type="password"
          placeholder="Confirm Password"
        />
      </div>

      <div className="w-full">
        <label className="mt-4 flex justify-center items-center gap-2">
          <input type="checkbox" className="w-4 h-4" />
          <span>I consent to the terms and conditions</span>
        </label>
      </div>
    </div>
  );
}
