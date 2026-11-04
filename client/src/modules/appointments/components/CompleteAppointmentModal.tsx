import { useForm } from 'react-hook-form'
import Modal from '#/components/Modal/Modal'
import ModalFooter from '#/components/Modal/ModalFooter'
import ModalHeader from '#/components/Modal/ModalHeader'
import ModalContent from '#/components/Modal/ModalContent'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data?: { is_hidden?: boolean }) => Promise<void>
  apiError: string | null
  isClinician: boolean
}

export default function CompleteAppointmentModal({
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={submit}>
        <ModalHeader title="Complete Appointment" variant="success" />

        <div className="p-8 space-y-6">
          {apiError && (
            <div className="alert alert-error" role="alert">
              {apiError}
            </div>
          )}

          <ModalContent
            text={
              <>
                Completing this appointment is <b>irreversible</b> and you will
                be
                <b>able to add SOAP to this patient</b>
              </>
            }
          />
        </div>
      </form>

      <ModalFooter
        onSubmit={onSubmit}
        onClose={onClose}
        isDisabled={formState.isSubmitting}
        variant="success"
      />
    </Modal>
  )
}
