import { Link } from "@tanstack/react-router";

export default function RegisterPatient() {
  return (
    <form
      onSubmit={() => {
        alert("submit");
      }}
      className="flex flex-col gap-4"
    >
      <PatientPersonalForm />
      <PatientAccountForm />
      <button className="btn btn-primary mt-4">Submit</button>
      <Link className="mx-auto" to="/login">
        I already have an account.{" "}
        <span className="link link-hover">Login here.</span>
      </Link>
    </form>
  );
}

function PatientPersonalForm() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-semibold">Personal Information</h1>
      <div className="flex flex-col gap-4">
        <div className="grid md:grid-cols-2 grid-cols-1 grid-rows-1 gap-4 [&>input]:w-full">
          <input className="input" type="text" placeholder="First Name" />
          <input className="input" type="text" placeholder="Last Name" />
        </div>

        <div className="flex flex-col gap-4 [&>input]:w-full">
          <input className="input" type="date" placeholder="Date of Birth" />
          <input className="input" type="text" placeholder="Diagnosis" />
        </div>
      </div>
    </div>
  );
}

function PatientAccountForm() {
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
          <input type="checkbox" className="checkbox checkbox-sm" />
          <span>I consent to the terms and conditions</span>
        </label>
      </div>
    </div>
  );
}
