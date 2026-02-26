export default function PatientInfo() {
  return (
    <>
      <p className="font-bold uppercase text-primary">Patient Information</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Name</p>
          <p>Jose Patient</p>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Email</p>
          <p>emailnijose@email.com</p>
        </div>
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Diagnosis</p>
          <p>SLP</p>
        </div>
      </div>
    </>
  )
}
