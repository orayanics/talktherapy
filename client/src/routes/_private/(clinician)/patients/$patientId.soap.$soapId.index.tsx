import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { fetchSoapById } from '@/api/records'
import StateLoading from '@/components/State/StateLoading'
import StateError from '@/components/State/StateError'
import StateNull from '@/components/State/StateNull'
import { Row } from '@/components/Table/Row'
import { formatDate } from '@/utils/useDate'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId/soap/$soapId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { soapId, patientId } = Route.useParams()

  const { data, isPending, isError } = useQuery({
    ...fetchSoapById(soapId),
    enabled: !!soapId,
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

      {isPending ? (
        <StateLoading />
      ) : isError ? (
        <StateError />
      ) : !data ? (
        <StateNull />
      ) : (
        <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6 space-y-2">
          <h1 className="text-xl font-bold pb-2 mb-2 border-b border-slate-300">
            SOAP Details
          </h1>
          <Row label="Date" value={formatDate(data.createdAt)} />
          <Row label="Clinician" value={data.clinician.name} />
          <Row label="Activity Plan" value={data.activity_plan} />
          <Row label="Session Type" value={data.session_type} />
          <Row label="Subjective Notes" value={data.subjective_notes} />
          <Row label="Objective Notes" value={data.objective_notes} />
          <Row label="Assessment" value={data.assessment} />
          <Row label="Recommendation" value={data.recommendation} />
          <Row label="Comments" value={data.comments} />
        </div>
      )}
    </div>
  )
}
