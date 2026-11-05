import SoapDetails from './SoapDetails'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export default function ClinicianSoapPage() {
  const { soapId, patientId } = useParams({
    from: '/_private/(clinician)/patients/$patientId/soap/$soapId/',
  })

  return (
    <div className="space-y-6">
      <Link
        to="/patients/$patientId"
        params={{ patientId: patientId }}
        className="flex gap-2 items-center link link-hover text-slate-600"
      >
        <ArrowLeft size={16} />
        Patient
      </Link>

      <SoapDetails soapId={soapId} />
    </div>
  )
}
