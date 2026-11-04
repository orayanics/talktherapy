import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '#/components/Modal/Modal'
import { AppointmentActionSchema } from '../types/schema'
import type { TAppointmentAction } from '../types/schema'
import ModalFooter from '#/components/Modal/ModalFooter'
import ModalHeader from '#/components/Modal/ModalHeader'
import ModalContent from '#/components/Modal/ModalContent'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TAppointmentAction) => Promise<void>
  isClinician: boolean
  apiError: string | null
}

const FORM_CONTENT = {
  clinician: {
    header: 'Reject Appointment',
    description: (
      <>
        Rejecting this appointment is <b>irreversible</b>. You have the option
        to set this <b>appointment hidden</b> from list view, which will make it
        visible to patients again.
      </>
    ),
    submitText: 'Reject',
  },
  patient: {
    header: 'Cancel Appointment',
    description: (
      <>
        Canceling this appointment is irreversible. You{' '}
        <b>cannot cancel an appointment 1 day before</b> the scheduled time.
      </>
    ),
    submitText: 'Submit',
  },
}

export default function AppointmentActionModal({
  isOpen,
  onClose,
  onSubmit,
  isClinician,
  apiError,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TAppointmentAction>({
    resolver: zodResolver(AppointmentActionSchema),
    defaultValues: { reason: '', is_hidden: false },
  })

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  const submit = handleSubmit(async (data) => {
    try {
      await onSubmit(data)
      onClose()
    } catch {
      return
    }
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={submit}>
        <ModalHeader
          title={
            isClinician
              ? FORM_CONTENT.clinician.header
              : FORM_CONTENT.patient.header
          }
          description="Action Required"
          variant="error"
        />

        <div className="p-8 space-y-6">
          {apiError && (
            <div className="alert alert-soft alert-error" role="alert">
              {apiError}
            </div>
          )}

          <ModalContent
            text={
              isClinician
                ? FORM_CONTENT.clinician.description
                : FORM_CONTENT.patient.description
            }
          />

          <div className="flex flex-col">
            <label htmlFor="appointment-action-reason" className="label">
              Reason
            </label>
            <textarea
              id="appointment-action-reason"
              {...register('reason')}
              className="textarea w-full"
              aria-invalid={Boolean(errors.reason)}
              aria-describedby={
                errors.reason ? 'appointment-action-reason-error' : undefined
              }
            />
            {errors.reason && (
              <p
                id="appointment-action-reason-error"
                role="alert"
                className="text-sm text-error"
              >
                {errors.reason.message}
              </p>
            )}
          </div>

          {isClinician && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="appointment-action-hidden"
                {...register('is_hidden')}
                className="checkbox checkbox-sm"
              />
              <label htmlFor="appointment-action-hidden" className="label">
                Hide from List
              </label>
            </div>
          )}
        </div>
      </form>

      <ModalFooter
        onClose={onClose}
        onSubmit={submit}
        isDisabled={isSubmitting}
        label={
          isClinician
            ? FORM_CONTENT.clinician.submitText
            : FORM_CONTENT.patient.submitText
        }
        variant="error"
      />
    </Modal>
  )
}
