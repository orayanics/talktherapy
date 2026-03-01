import type { ParsedError } from '~/utils/errors'
import ModalBody from '~/components/Modal/ModalBody'
import ModalHeader from '~/components/Modal/ModalHeader'
import { hasOnlyMessage } from '~/utils/errors'

interface ModalCancelAppointmentProps {
  title?: string
  description?: string
  confirmText?: string
  reason: string
  onReasonChange: (value: string) => void
  showKeepBlocked?: boolean
  keepBlocked?: boolean
  onKeepBlockedChange?: (value: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  states: {
    isLoading: boolean
    errors: ParsedError | null
  }
}

export default function ModalCancelAppointment(
  props: ModalCancelAppointmentProps,
) {
  const {
    title = 'Cancel Appointment',
    description = 'Are you sure you want to cancel this appointment? This action cannot be undone.',
    confirmText = 'Cancel Appointment',
    reason,
    onReasonChange,
    showKeepBlocked = false,
    keepBlocked = true,
    onKeepBlockedChange,
    onConfirm,
    onCancel,
    states,
  } = props
  const { isLoading, errors } = states

  return (
    <ModalBody isOpen={true} onClose={onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onConfirm()
        }}
      >
        {hasOnlyMessage(errors) && (
          <p className="text-error text-center text-sm mt-1">
            {errors!.message}
          </p>
        )}
        <div className="flex flex-col gap-4">
          <ModalHeader>{title}</ModalHeader>
          <p className="text-sm">{description}</p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Reason{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered textarea-sm w-full resize-none"
              rows={3}
              placeholder="Provide a reason for cancellation..."
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
            />
          </div>
          {showKeepBlocked && (
            <label className="flex flex-row items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-error"
                checked={keepBlocked}
                onChange={(e) => onKeepBlockedChange?.(e.target.checked)}
              />
              <span className="text-sm">Keep slot blocked after rejection</span>
            </label>
          )}
          <div className="flex flex-row gap-2 justify-end">
            <button type="button" className="btn" onClick={onCancel}>
              Back
            </button>
            <button
              type="submit"
              className="btn btn-error"
              disabled={isLoading}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </form>
    </ModalBody>
  )
}
