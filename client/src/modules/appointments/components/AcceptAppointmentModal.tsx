import { useForm } from 'react-hook-form'
import Modal from '#/components/Modal/Modal'
import ModalContent from '#/components/Modal/ModalContent'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data?: { is_hidden?: boolean }) => Promise<void>
  apiError: string | null
  isClinician: boolean
}

export default function AcceptAppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  apiError,
}: Props) {
  const { handleSubmit, formState } = useForm<{ is_hidden: boolean }>({
    defaultValues: { is_hidden: false },
  })

  const submit = handleSubmit(async (data) => {
    try {
      await onSubmit(data)
      onClose()
    } catch {
      return
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Accept Appointment"
      description="Action Required"
      variant="info"
      submitVariant="default"
      onSubmit={submit}
      isDisabled={formState.isSubmitting}
    >
      {apiError && (
        <div className="alert alert-error" role="alert">
          {apiError}
        </div>
      )}

      <ModalContent
        text={
          <>
            Accepting this appointment is <b>irreversible</b>.
          </>
        }
      />
    </Modal>
  )
}
