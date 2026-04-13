import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import ModalBody from '@/components/Modal/ModalBody'
import { AppointmentActionSchema } from './schema'
import type { TAppointmentAction } from './schema'
import { CircleX } from 'lucide-react'

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
    formState: { errors, isSubmitting },
  } = useForm<TAppointmentAction>({
    resolver: zodResolver(AppointmentActionSchema),
    defaultValues: { reason: '', is_hidden: false },
  })

  const submit = handleSubmit(async (data) => {
    await onSubmit(data)
    onClose()
  })

  return (
    <ModalBody isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={submit}
        className="bg-white overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="bg-rose-100 p-8 space-y-2 text-center">
          <CircleX size={42} className="text-rose-600 mx-auto" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            {isClinician
              ? FORM_CONTENT.clinician.header
              : FORM_CONTENT.patient.header}
          </h1>
          <p className="text-rose-700 text-xs font-semibold uppercase tracking-widest mt-1">
            Action Required
          </p>
        </div>

        <div className="p-8 space-y-6">
          {apiError && (
            <div className="alert alert-soft alert-error">{apiError}</div>
          )}

          <div className="text-center">
            <p className="text-slate-600 leading-relaxed">
              {isClinician
                ? FORM_CONTENT.clinician.description
                : FORM_CONTENT.patient.description}
            </p>
          </div>

          <div className="flex flex-col">
            <label className="label">Reason</label>
            <textarea {...register('reason')} className="textarea w-full" />
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          {isClinician && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('is_hidden')}
                className="checkbox"
              />
              <label className="label">Hide from List</label>
            </div>
          )}
        </div>

        <div className="p-2 flex justify-end gap-2">
          <button type="button" className="btn btn-neutral" onClick={onClose}>
            Close
          </button>
          <button disabled={isSubmitting} className="btn btn-error">
            {isClinician
              ? FORM_CONTENT.clinician.submitText
              : FORM_CONTENT.patient.submitText}
          </button>
        </div>
      </form>
    </ModalBody>
  )
}
