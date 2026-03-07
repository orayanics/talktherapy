import { format } from 'date-fns'

interface PatientDetailProps {
  name: string | null
  email: string
  diagnosis: string | null
  first_completed_at: string
}

export default function PatientDetail(props: PatientDetailProps) {
  const { diagnosis, email, first_completed_at, name } = props
  const completedAt = format(new Date(first_completed_at), 'MMM d, yyyy')
  return (
    <>
      <p className="font-bold uppercase text-primary">User Information</p>
      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Full Name</p>
          <p>{name}</p>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Email Address</p>
          <p>{email}</p>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Diagnosis</p>
          <p>{diagnosis}</p>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">Completed At</p>
          <p>{completedAt}</p>
        </div>
      </div>
    </>
  )
}
