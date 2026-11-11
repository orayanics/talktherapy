import { useQuery } from '@tanstack/react-query'
import { formatDate } from '#/utils/useDate'
import { fetchAppointment } from '../api/appointments'

import { Row } from '#/components/Table/Row'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import AppointmentPill from './AppointmentPill'
import RolePill from '#/modules/users/components/RolePill'
import Drawer from '#/components/Drawer'

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
      panelClassName="min-h-full w-full max-w-lg overflow-y-auto bg-base-100 text-base-content"
    >
      {query.isPending ? (
        <StateLoading />
      ) : query.isError || !appointment ? (
        <StateError />
      ) : (
        <div className="space-y-4 p-6">
          <div className="space-y-4">
            <p className=" border-b border-dashed border-border pb-4 text-xl font-bold my-0! mb-4!">
              Details
            </p>
            <Row label="Status">
              <AppointmentPill status={appointment.status} />
            </Row>

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
            <div className="space-y-4">
              <p className=" border-y border-dashed border-border py-4 text-xl font-bold my-0! mb-4!">
                Patient Complaint
              </p>
              <Row
                textClassName="text-right"
                label="Diagnosis"
                value={encounter.diagnosis}
              />
              <Row
                textClassName="text-right"
                label="Chief Complaint"
                value={encounter.chief_complaint}
              />
              <Row
                textClassName="text-right"
                label="Referral Source"
                value={encounter.referral_source}
              />
              <Row
                label="Referral Document"
                value={
                  encounter.referral_url ? (
                    <a
                      href={encounter.referral_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline text-right"
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

          {events.length != 0 && (
            <div>
              <p className=" border-y border-dashed border-border py-4 text-xl font-bold my-0! mb-4!">
                Appointment Events
              </p>
              <div className="relative ml-3 space-y-10 border-l-2 border-slate-100">
                {events.map((event) => (
                  <div key={event.id} className="group relative pl-8">
                    <div className="absolute -left-1.75 h-3 w-3 rounded-full border-2 border-primary bg-white " />

                    <div className="flex flex-col gap-1">
                      <time className="text-xs uppercase text-muted">
                        {formatDate(event.created_at)}
                      </time>

                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold capitalize my-0!">
                          {event.to_status.toLowerCase().replace('_', ' ')}
                        </h4>
                        <span className="text-muted">•</span>
                        <RolePill role={event.actor_type} />
                      </div>

                      {event.reason && (
                        <div className="rounded-box border border-border bg-slate-50 p-4">
                          <p className="text-xs leading-relaxed uppercase font-bold my-0!">
                            Reason
                          </p>
                          <p className="leading-relaxed my-0!">
                            {event.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  )
}
