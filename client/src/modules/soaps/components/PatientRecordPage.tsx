import SoapDetails from './SoapDetails'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export default function PatientRecordPage() {
  const { soapId } = useParams({ from: '/_private/(patient)/records/$soapId' })

  return (
    <div className="space-y-6">
      <Link
        to="/records"
        className="flex gap-2 items-center link link-hover text-slate-600"
      >
        <ArrowLeft size={16} />
        Records
      </Link>

      <SoapDetails soapId={soapId} />
    </div>
  )
}
