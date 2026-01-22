export default function RegisterPatient() {
  return (
    <form
      onSubmit={() => {
        alert("submit");
      }}
      className="flex flex-col gap-5 p-4"
    >
      <PatientPersonalForm />
      <PatientAccountForm />
      <button className="btn btn-primary mt-4">Submit</button>
    </form>
  );
}

function PatientPersonalForm() {
  return (
    <div>
      <h1>Personal Information</h1>
      <div className="flex flex-col gap-4">
        <div className="grid md:grid-cols-2 grid-cols-1 grid-rows-1 gap-4">
          <input className="input" type="text" placeholder="First Name" />
          <input className="input" type="text" placeholder="Last Name" />
        </div>

        <div className="flex flex-col gap-4">
          <input className="input" type="date" placeholder="Date of Birth" />
          <input className="input" type="text" placeholder="Diagnosis" />
        </div>
      </div>
    </div>
  );
}

function PatientAccountForm() {
  return (
    <div>
      <h1>Account</h1>
      <div className="flex flex-col gap-4">
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
