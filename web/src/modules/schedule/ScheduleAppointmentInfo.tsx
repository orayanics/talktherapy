export default function ScheduleAppointmentInfo() {
  return (
    <>
      <div>
        <p className="font-bold uppercase text-primary">Appointment Details</p>
        <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Assigned Patient</p>
            <p>Nicole Siraulo</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Appointment Date</p>
            <p>01/01/2024</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Appointment Time</p>
            <p>10:00 AM - 11:00 AM</p>
          </div>
        </div>
      </div>

      <div>
        <p className="font-bold uppercase text-primary">Patient Details</p>
        <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Medical Diagnosis</p>
            <p>SLP</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Source of Referral</p>
            <p>UST</p>
          </div>

          <div className="flex flex-row justify-between gap-2">
            <p className="font-bold">Chief Complaint</p>
            <p>Headache</p>
          </div>
        </div>
      </div>
    </>
  );
}
