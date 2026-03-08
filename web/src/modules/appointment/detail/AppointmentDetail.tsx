import { Link } from '@tanstack/react-router'
import { parseISO } from 'date-fns'
import ModalCancelAppointment from './ModalCancelAppointment'
import useAppointmentActions from './useAppointmentActions'
import AppointmentEventHistory from './AppointmentEventHistory'
import type {
  ServerAppointmentStatus,
  SlotAppointmentDto,
} from '~/models/booking'
import ModalConfirm from '~/components/Modal/ModalConfirm'
import {
  APPOINTMENT_STATUS_BADGE,
  APPOINTMENT_STATUS_TEXT,
} from '~/config/appointmentStatus'
import { formatToLocalDate, getTime } from '~/utils/date'
import { useAuthGuard } from '~/hooks/useAuthGuard'

const CAN_CONFIRM: Array<ServerAppointmentStatus> = ['PENDING']
const CAN_COMPLETE: Array<ServerAppointmentStatus> = ['CONFIRMED']
const CAN_CANCEL: Array<ServerAppointmentStatus> = ['PENDING', 'CONFIRMED']
const CAN_NO_SHOW: Array<ServerAppointmentStatus> = ['CONFIRMED']

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-row justify-between gap-2 py-3 border-b border-dashed border-gray-100">
      <p className="font-bold text-sm">{label}</p>
      <p className="text-sm text-right">{value ?? '—'}</p>
    </div>
  )
}

export default function AppointmentDetail(props: SlotAppointmentDto) {
  const { id, status, booked_at, room_id, slot, encounter, events } = props

  const {
    confirmOpen,
    completeOpen,
    cancelOpen,
    noShowOpen,
    cancelReason,
    noShowReason,
    setNoShowReason,
    keepBlocked,
    setKeepBlocked,
    confirmErrors,
    completeErrors,
    cancelErrors,
    noShowErrors,
    isConfirming,
    isCompleting,
    isCancelling,
    isMarkingNoShow,
    openConfirm,
    closeConfirm,
    openComplete,
    closeComplete,
    openCancel,
    closeCancel,
    openNoShow,
    closeNoShow,
    handleConfirm,
    handleComplete,
    handleCancel,
    handleNoShow,
    setCancelReason,
  } = useAppointmentActions(id)

  const date = formatToLocalDate(slot.starts_at)
  const startTime = getTime(slot.starts_at)
  const endTime = getTime(slot.ends_at)
  const bookedDate = formatToLocalDate(booked_at)

  const isPastAppointment = parseISO(slot.starts_at) < new Date()

  const { is } = useAuthGuard()
  const isClinician = is('clinician')

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
            Patient Intake
          </p>
          <InfoRow label="Medical Diagnosis" value={encounter?.diagnosis} />
          <InfoRow label="Chief Complaint" value={encounter?.chief_complaint} />
          <InfoRow
            label="Source of Referral"
            value={encounter?.referral_source}
          />
          {encounter?.referral_url && (
            <div className="flex flex-row justify-between gap-2 py-3 border-b border-dashed border-gray-100">
              <p className="font-bold text-sm">Referral Document</p>
              <a
                href={encounter.referral_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline"
              >
                View
              </a>
            </div>
          )}
          {!encounter && (
            <p className="text-sm text-gray-400 py-2">
              No intake information provided.
            </p>
          )}
        </div>

        {/* Event History */}
        <div>
          <p className="font-mono text-primary text-xs uppercase mb-3">
            Event History
          </p>
          <AppointmentEventHistory events={events} variant="clinician" />
        </div>

        {/* Actions */}
        {(CAN_CONFIRM.includes(status) ||
          CAN_COMPLETE.includes(status) ||
          CAN_CANCEL.includes(status) ||
          (CAN_NO_SHOW.includes(status) && isPastAppointment)) &&
          isClinician && (
            <div className="flex flex-row gap-2 justify-end">
              {CAN_CANCEL.includes(status) && (
                <button
                  type="button"
                  className="btn btn-error btn-outline"
                  onClick={openCancel}
                >
                  {status === 'PENDING' ? 'Reject' : 'Cancel Appointment'}
                </button>
              )}
              {CAN_NO_SHOW.includes(status) && isPastAppointment && (
                <button
                  type="button"
                  className="btn btn-warning btn-outline"
                  onClick={openNoShow}
                >
                  Mark No Show
                </button>
              )}
              {CAN_COMPLETE.includes(status) && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={openComplete}
                >
                  Mark as Completed
                </button>
              )}
              {CAN_CONFIRM.includes(status) && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openConfirm}
                >
                  Accept
                </button>
              )}
            </div>
          )}
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <ModalConfirm
          title="Accept Appointment"
          description="Are you sure you want to accept this appointment? The patient will be notified."
          confirmText="Accept"
          cancelText="Back"
          onConfirm={handleConfirm}
          onCancel={closeConfirm}
          states={{ isLoading: isConfirming, errors: confirmErrors }}
        />
      )}

      {/* Complete modal */}
      {completeOpen && (
        <ModalConfirm
          title="Complete Appointment"
          description="Are you sure you want to mark this appointment as completed?"
          confirmText="Mark as Completed"
          cancelText="Back"
          onConfirm={handleComplete}
          onCancel={closeComplete}
          states={{ isLoading: isCompleting, errors: completeErrors }}
        />
      )}

      {cancelOpen && (
        <ModalCancelAppointment
          title={
            status === 'PENDING' ? 'Reject Appointment' : 'Cancel Appointment'
          }
          confirmText={status === 'PENDING' ? 'Reject' : 'Cancel Appointment'}
          description={
            status === 'PENDING'
              ? 'Are you sure you want to reject this appointment request? The slot will be blocked.'
              : 'Are you sure you want to cancel this appointment? This action cannot be undone.'
          }
          reason={cancelReason}
          onReasonChange={setCancelReason}
          showKeepBlocked={status === 'PENDING'}
          keepBlocked={keepBlocked}
          onKeepBlockedChange={setKeepBlocked}
          onConfirm={handleCancel}
          onCancel={closeCancel}
          states={{ isLoading: isCancelling, errors: cancelErrors }}
        />
      )}

      {noShowOpen && (
        <ModalCancelAppointment
          title="Mark as No Show"
          confirmText="Mark No Show"
          description="The patient did not attend this appointment. This action cannot be undone."
          reason={noShowReason}
          onReasonChange={setNoShowReason}
          showKeepBlocked={false}
          onConfirm={handleNoShow}
          onCancel={closeNoShow}
          states={{ isLoading: isMarkingNoShow, errors: noShowErrors }}
        />
      )}
    </>
  )
}
