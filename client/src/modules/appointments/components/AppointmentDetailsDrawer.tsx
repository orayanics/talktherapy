import { useQuery } from '@tanstack/react-query'
import Drawer from '#/components/Drawer'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import { Row } from '#/components/Table/Row'
import RolePill from '#/components/Decorator/RolePill'
import { formatDate } from '#/utils/useDate'
import { fetchAppointment } from '../api/appointments'

export default function AppointmentDetailsDrawer({
  appointmentId,
  onClose,
}: {
  appointmentId: string | null
  onClose: () => void
}) {
  const query = useQuery({
    ...fetchAppointment(appointmentId ?? ''),
    enabled: Boolean(appointmentId),
  })
  const appointment = query.data?.data
  const encounter = appointment?.encounter
  const events = appointment?.events ?? []

  return (
    <Drawer
      isOpen={Boolean(appointmentId)}
      onClose={onClose}
      label="Appointment details"
      title="Appointment Details"
      className={appointmentId ? 'fixed inset-0 z-40' : 'hidden'}
      panelClassName="min-h-full w-full max-w-md overflow-y-auto bg-base-100 text-base-content"
    >
      {query.isPending ? (
        <StateLoading />
      ) : query.isError || !appointment ? (
        <StateError />
      ) : (
        <div className="space-y-4 p-6">
          <div className="space-y-2 rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <Row label="Status" value={appointment.status} />
            {appointment.status !== 'COMPLETED' && (
              <Row label="Room ID" value={appointment.room_id} />
            )}
            <Row
              label="Appointment Time"
              value={
                <div className="flex gap-4">
                  <span>{formatDate(appointment.slot.start_at, 'p')}</span>
                  <span>to</span>
                  <span>{formatDate(appointment.slot.end_at, 'p')}</span>
                </div>
              }
            />
            <Row label="Patient Name" value={appointment.patient.name} />
            <Row label="Patient Email" value={appointment.patient.email} />
            <Row label="Clinician Name" value={appointment.clinician.name} />
            <Row
              label="Clinician Specialization"
              value={appointment.clinician.diagnosis?.label ?? 'N/A'}
            />
          </div>

          {encounter && (
            <div className="space-y-2 rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
              <h3 className="mb-2 border-b border-slate-300 pb-2 text-xl font-bold">
                Patient Complaint
              </h3>
              <Row label="Diagnosis" value={encounter.diagnosis} />
              <Row label="Chief Complaint" value={encounter.chief_complaint} />
              <Row label="Referral Source" value={encounter.referral_source} />
              <Row
                label="Referral Document"
                value={
                  encounter.referral_url ? (
                    <a
                      href={encounter.referral_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Referral Document
                    </a>
                  ) : (
                    'N/A'
                  )
                }
              />
            </div>
          )}

          <div className="space-y-6 rounded-lg border border-slate-300 bg-white p-6">
            <h3 className="mb-6 border-b border-slate-300 pb-2 text-xl font-bold">
              Appointment Events
            </h3>
            <div className="relative ml-3 space-y-10 border-l-2 border-slate-100">
              {events.map((event) => (
                <div key={event.id} className="group relative pl-8">
                  <div className="absolute -left-1.75 h-3 w-3 rounded-full border-2 border-neutral/80 bg-white shadow-sm" />
                  <div className="flex flex-col gap-1">
                    <time className="text-xs font-medium uppercase text-slate-500">
                      {formatDate(event.created_at)}
                    </time>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold capitalize text-slate-900">
                        {event.to_status.toLowerCase().replace('_', ' ')}
                      </h4>
                      <span className="text-slate-300">•</span>
                      <RolePill role={event.actor_type} />
                    </div>
                    {event.reason && (
                      <div className="rounded-lg border border-slate-300 bg-slate-50 p-2 shadow-sm">
                        <p className="text-sm leading-relaxed text-slate-900">
                          <span className="font-medium text-slate-600">
                            Reason:
                          </span>{' '}
                          {event.reason}
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
    </Drawer>
  )
}
