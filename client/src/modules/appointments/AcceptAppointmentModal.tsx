import { useForm } from 'react-hook-form'
import ModalBody from '@/components/Modal/ModalBody'
import { CircleCheck } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data?: { is_hidden?: boolean }) => Promise<void>
  isClinician: boolean
}

export default function AcceptAppointmentModal({
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const { handleSubmit, formState } = useForm<{ is_hidden: boolean }>({
    defaultValues: { is_hidden: false },
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
        <div className="bg-emerald-100 p-8 space-y-2 text-center">
          <CircleCheck size={42} className="text-emerald-600 mx-auto" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Accept Appointment
          </h1>
          <p className="text-emerald-700 text-xs font-semibold uppercase tracking-widest mt-1">
            Action Required
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <p className="text-slate-600 leading-relaxed">
              Accepting this appointment is <b>irreversible</b>.
            </p>
          </div>
        </div>

        <div className="p-2 flex justify-end gap-2">
          <button type="button" className="btn btn-neutral" onClick={onClose}>
            Cancel
          </button>
          <button disabled={formState.isSubmitting} className="btn btn-success">
            Accept
          </button>
        </div>
      </form>
    </ModalBody>
  )
}
