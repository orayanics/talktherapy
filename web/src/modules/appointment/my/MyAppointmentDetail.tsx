import { Link } from '@tanstack/react-router'
import ModalRescheduleAppointment from './ModalRescheduleAppointment'
import useMyAppointmentActions from './useMyAppointmentActions'
import type { ServerAppointmentStatus } from '~/models/booking'
import type { MyAppointmentDetailProps } from '~/models/components'
import ModalCancelAppointment from '~/modules/appointment/detail/ModalCancelAppointment'
import AppointmentEventHistory from '~/modules/appointment/detail/AppointmentEventHistory'
import {
  APPOINTMENT_STATUS_BADGE,
  APPOINTMENT_STATUS_TEXT,
} from '~/config/appointmentStatus'
import { formatToLocalDate, getTime } from '~/utils/date'

const CAN_CANCEL: Array<ServerAppointmentStatus> = ['PENDING', 'CONFIRMED']
const CAN_RESCHEDULE: Array<ServerAppointmentStatus> = ['PENDING', 'CONFIRMED']

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-row justify-between gap-2 py-3 border-b border-dashed border-gray-100">
      <p className="font-bold text-sm">{label}</p>
      <p className="text-sm text-right">{value ?? '—'}</p>
    </div>
  )
}

export default function MyAppointmentDetail({
  appointment,
}: MyAppointmentDetailProps) {
  const { id, status, booked_at, room_id, slot, encounter, events } =
    appointment

  const {
    cancelOpen,
    cancelReason,
    cancelErrors,
    isCancelling,
    openCancel,
    closeCancel,
    handleCancel,
    setCancelReason,
    rescheduleOpen,
    rescheduleErrors,
    isRescheduling,
    openReschedule,
    closeReschedule,
    handleReschedule,
  } = useMyAppointmentActions(id)

  const date = formatToLocalDate(slot.starts_at)
  const startTime = getTime(slot.starts_at)
  const endTime = getTime(slot.ends_at)
  const bookedDate = formatToLocalDate(booked_at)
  const clinicianName = slot.clinician.user.name ?? '—'
  const specialty = slot.clinician.diagnosis?.label ?? '—'

  const canCancel = CAN_CANCEL.includes(status)
  const canReschedule = CAN_RESCHEDULE.includes(status)

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-2">
          <p className="font-bold uppercase text-primary text-sm tracking-wide">
            Appointment Details
          </p>
          <span className={APPOINTMENT_STATUS_BADGE[status]}>
            {APPOINTMENT_STATUS_TEXT[status]}
          </span>
        </div>

        {/* Schedule info */}
        <div>
          <p className="font-mono text-primary text-xs uppercase mb-1">
            Schedule
          </p>
          <InfoRow label="Date" value={date} />
          <InfoRow label="Time" value={`${startTime} – ${endTime}`} />
          <InfoRow label="Booked On" value={bookedDate} />
          <InfoRow label="Clinician" value={clinicianName} />
          <InfoRow label="Specialty" value={specialty} />
          {room_id && status !== 'CONFIRMED' && (
            <InfoRow
              label="Room ID"
              value={<code className="text-xs font-mono">{room_id}</code>}
            />
          )}
          {room_id && status === 'CONFIRMED' && (
            <div className="flex flex-row justify-between gap-2 py-3 border-b border-dashed border-gray-100">
              <p className="font-bold text-sm">Session Room</p>
              <Link
                to="/$roomId"
                params={{ roomId: room_id }}
                className="btn btn-primary btn-xs"
              >
                Join Session
              </Link>
            </div>
          )}
        </div>

        {/* Encounter / intake info */}
        <div>
          <p className="font-mono text-primary text-xs uppercase mb-1">
            Intake Information
          </p>
          <InfoRow label="Chief Complaint" value={encounter?.chief_complaint} />
          <InfoRow label="Medical Diagnosis" value={encounter?.diagnosis} />
          <InfoRow
            label="Source of Referral"
            value={encounter?.referral_source}
          />
          {!encounter && (
            <p className="text-sm text-gray-400 py-2">
              No intake information on record.
            </p>
          )}
        </div>

        {/* Event History */}
        <div>
          <p className="font-mono text-primary text-xs uppercase mb-3">
            Event History
          </p>
          <AppointmentEventHistory events={events} variant="patient" />
        </div>

        {/* Actions */}
        {(canCancel || canReschedule) && (
          <div className="flex flex-row gap-2 justify-end pt-2 border-t border-dashed border-gray-200">
            {canCancel && (
              <button
                type="button"
                className="btn btn-error btn-outline btn-sm"
                onClick={openCancel}
              >
                Cancel Appointment
              </button>
            )}
            {canReschedule && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={openReschedule}
              >
                Reschedule
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {cancelOpen && (
        <ModalCancelAppointment
          title="Cancel Appointment"
          description="Are you sure you want to cancel this appointment? The slot will become available again."
          confirmText="Cancel Appointment"
          reason={cancelReason}
          onReasonChange={setCancelReason}
          showKeepBlocked={false}
          onConfirm={handleCancel}
          onCancel={closeCancel}
          states={{ isLoading: isCancelling, errors: cancelErrors }}
        />
      )}

      {/* Reschedule modal */}
      {rescheduleOpen && (
        <ModalRescheduleAppointment
          clinicianId={slot.clinician.id}
          currentSlotId={slot.id}
          onConfirm={handleReschedule}
          onCancel={closeReschedule}
          states={{ isLoading: isRescheduling, errors: rescheduleErrors }}
        />
      )}
    </>
  )
}
