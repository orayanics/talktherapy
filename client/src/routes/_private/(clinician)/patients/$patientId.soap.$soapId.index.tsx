import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { fetchSoapById } from '@/api/records'
import StateLoading from '@/components/State/StateLoading'
import StateError from '@/components/State/StateError'
import StateNull from '@/components/State/StateNull'

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

  if (isPending) return <StateLoading />
  if (isError) return <StateError />
  if (!data) return <StateNull />

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

      <div className="w-full bg-white">
        <div className="rounded-lg border border-slate-300 shadow-sm flex flex-col gap-4 p-6">
          <div className="space-y-2">
            <div>
              <strong>Date:</strong> {data.created_at}
            </div>
            <div>
              <strong>Clinician:</strong> {data.clinician_name}
            </div>
            <div>
              <strong>Activity Plan:</strong> {data.activity_plan}
            </div>
            <div>
              <strong>Session Type:</strong> {data.session_type}
            </div>
            <div>
              <strong>Subjective:</strong> {data.subjective_notes}
            </div>
            <div>
              <strong>Objective:</strong> {data.objective_notes}
            </div>
            <div>
              <strong>Assessment:</strong> {data.assessment}
            </div>
            <div>
              <strong>Recommendation:</strong> {data.recommendation}
            </div>
            <div>
              <strong>Comments:</strong> {data.comments}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
