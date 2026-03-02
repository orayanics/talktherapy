import ModalCancelAppointment from './ModalCancelAppointment'
import useAppointmentActions from './useAppointmentActions'
import AppointmentEventHistory from './AppointmentEventHistory'
import type {
  ServerAppointmentStatus,
  SlotAppointmentDto,
} from '~/models/schedule'
import ModalConfirm from '~/components/Modal/ModalConfirm'
import { formatToLocalDate, getTime } from '~/utils/date'
import { useAuthGuard } from '~/hooks/useAuthGuard'

const STATUS_BADGE: Record<ServerAppointmentStatus, string> = {
  PENDING: 'badge badge-outline bg-yellow-50 text-yellow-800 border-yellow-200',
  CONFIRMED: 'badge badge-outline bg-blue-50 text-blue-800 border-blue-200',
  CANCELLED: 'badge badge-outline bg-red-50 text-red-800 border-red-200',
  COMPLETED: 'badge badge-outline bg-green-50 text-green-800 border-green-200',
  NO_SHOW: 'badge badge-outline bg-gray-50 text-gray-800 border-gray-200',
}

const STATUS_LABEL: Record<ServerAppointmentStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No Show',
}

const CAN_CONFIRM: Array<ServerAppointmentStatus> = ['PENDING']
const CAN_COMPLETE: Array<ServerAppointmentStatus> = ['CONFIRMED']
const CAN_CANCEL: Array<ServerAppointmentStatus> = ['PENDING', 'CONFIRMED']

interface AppointmentDetailProps {
  appointment: SlotAppointmentDto
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-row justify-between gap-2 py-3 border-b border-dashed border-gray-100">
      <p className="font-bold text-sm">{label}</p>
      <p className="text-sm text-right">{value ?? '—'}</p>
    </div>
  )
}

export default function AppointmentDetail(props: AppointmentDetailProps) {
  const { appointment } = props
  const {
    id,
    status,
    booked_at,
    patient_id,
    room_id,
    slot,
    encounter,
    events,
  } = appointment

  const {
    confirmOpen,
    completeOpen,
    cancelOpen,
    cancelReason,
    keepBlocked,
    setKeepBlocked,
    confirmErrors,
    completeErrors,
    cancelErrors,
    isConfirming,
    isCompleting,
    isCancelling,
    openConfirm,
    closeConfirm,
    openComplete,
    closeComplete,
    openCancel,
    closeCancel,
    handleConfirm,
    handleComplete,
    handleCancel,
    setCancelReason,
  } = useAppointmentActions(id)

  const date = formatToLocalDate(slot.starts_at)
  const startTime = getTime(slot.starts_at)
  const endTime = getTime(slot.ends_at)
  const bookedDate = formatToLocalDate(booked_at)

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
          <span className={STATUS_BADGE[status]}>{STATUS_LABEL[status]}</span>
        </div>

        {/* Schedule info */}
        <div>
          <p className="font-mono text-primary text-xs uppercase mb-1">
            Schedule
          </p>
          <InfoRow label="Date" value={date} />
          <InfoRow label="Time" value={`${startTime} – ${endTime}`} />
          <InfoRow label="Booked On" value={bookedDate} />
          <InfoRow
            label="Patient ID"
            value={<code className="text-xs font-mono">{patient_id}</code>}
          />
          {room_id && (
            <InfoRow
              label="Room ID"
              value={<code className="text-xs font-mono">{room_id}</code>}
            />
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
          CAN_CANCEL.includes(status)) &&
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
    </>
  )
}
