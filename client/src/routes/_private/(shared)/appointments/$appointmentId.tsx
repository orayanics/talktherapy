import { fetchAppointment } from '@/api/schedule'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import StateError from '@/components/State/StateError'
import StateLoading from '@/components/State/StateLoading'
import { formatDate } from '@/utils/useDate'
import RolePill from '@/components/Decorator/RolePill'
import { ArrowLeft } from 'lucide-react'
import { Row } from '@/components/Table/Row'

export const Route = createFileRoute(
  '/_private/(shared)/appointments/$appointmentId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { appointmentId } = Route.useParams()

  const { data, isPending, isError } = useQuery(fetchAppointment(appointmentId))

  const appointment = data?.data
  const encounterObj = appointment?.encounter
    ? Array.isArray(appointment.encounter)
      ? appointment.encounter[0]
      : appointment.encounter
    : null
  const events = appointment?.events ?? []

  const showRoom = appointment?.status !== 'COMPLETED'

  return (
    <>
      {isPending ? (
        <StateLoading />
      ) : isError ? (
        <StateError />
      ) : !appointment ? (
        <StateError />
      ) : (
        <div className="space-y-6">
          <Link
            to="/appointments"
            className="flex gap-2 items-center link link-hover text-slate-600"
          >
            <ArrowLeft size={16} />
            Appointments
          </Link>
          <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6 space-y-2">
            <h1 className="text-xl font-bold pb-2 mb-2 border-b border-slate-300">
              Appointment Details
            </h1>
            <Row label="Status" value={appointment.status} />
            {showRoom && <Row label="Room ID" value={appointment.roomId} />}
            <Row
              label="Appointment Time"
              value={
                <div className="flex gap-4">
                  <p>{formatDate(appointment.slot.startAt, 'p')}</p>
                  <span>to</span>
                  <p>{formatDate(appointment.slot.endAt, 'p')}</p>
                </div>
              }
            />
            <Row label="Patient Name" value={appointment.patient.name} />
            <Row label="Patient Email" value={appointment.patient.email} />
            <Row label="Clinician Name" value={appointment.clinician.name} />
            <Row
              label="Clinician Specialization"
              value={appointment.clinician.diagnosis.label}
            />
          </div>

          {encounterObj && (
            <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6 space-y-2">
              <h1 className="text-xl font-bold pb-2 mb-2 border-b border-slate-300">
                Patient Complaint
              </h1>
              <Row label="Diagnosis" value={encounterObj.diagnosis} />
              <Row
                label="Chief Complaint"
                value={encounterObj.chiefComplaint}
              />
              <Row
                label="Referral Source"
                value={encounterObj.referralSource}
              />
              <Row
                label="Referral Document"
                value={
                  encounterObj.referralUrl ? (
                    <a
                      href={encounterObj.referralUrl}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View Referral Document
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : (
                    'N/A'
                  )
                }
              />
            </div>
          )}

          <div className="bg-white border border-slate-300 rounded-lg p-6 space-y-6">
            <h1 className="text-xl font-bold pb-2 mb-6 border-b border-slate-300">
              Appointment Events
            </h1>

            <div className="relative border-l-2 border-slate-100 ml-3 space-y-10">
              {events.map((ev) => (
                <div key={ev.id} className="relative pl-8 group">
                  <div className="absolute -left-1.75 w-3 h-3 rounded-full bg-white border-2 border-neutral/80 shadow-sm" />

                  <div className="flex flex-col gap-1">
                    <time className="text-xs font-medium uppercase text-slate-500">
                      {formatDate(ev.createdAt)}
                    </time>

                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 capitalize">
                        {ev.type.replace('_', ' ')}
                      </h3>
                      <span className="text-slate-300">•</span>
                      <RolePill role={ev.actorType} />
                    </div>

                    {ev.reason && (
                      <div className="p-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm">
                        <p className="text-slate-900 text-sm leading-relaxed">
                          <span className="font-medium text-slate-600">
                            Reason:
                          </span>{' '}
                          {ev.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
