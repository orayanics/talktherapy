import ModalHeader from '~/components/Modal/ModalHeader'
import ModalBody from '~/components/Modal/ModalBody'
import { useRegisterClinician } from './useUserAdd'
import { fieldError, hasOnlyMessage } from '~/utils/errors'

interface UserAddClinicianProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserAddClinician(props: UserAddClinicianProps) {
  const { isOpen, onClose } = props
  const { form, handleChange, handleSubmit, resetState, errors, isLoading } =
    useRegisterClinician()

  const handleClose = () => {
    resetState()
    onClose()
  }

  return (
    <ModalBody isOpen={isOpen} onClose={handleClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const isSuccess = await handleSubmit()
          if (isSuccess) {
            handleClose()
          }
        }}
        aria-disabled={isLoading}
      >
        <div className="flex flex-col gap-4">
          <ModalHeader>Add Clinician User</ModalHeader>
          <div>
            <label className="input w-full">
              <span className="label">Email</span>
              <input
                type="email"
                name="email"
                placeholder="email@email.com"
                value={form.email}
                onChange={handleChange}
              />
            </label>
            {hasOnlyMessage(errors) && (
              <p className="text-error text-center text-sm mt-1">
                {errors!.message}
              </p>
            )}
            {fieldError(errors, 'email') && (
              <p className="text-error text-sm mt-1">
                {fieldError(errors, 'email')}
              </p>
            )}
          </div>
        </div>
        <div className="modal-action flex-row">
          <button type="button" className="btn" onClick={handleClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading}
            aria-disabled={isLoading}
          >
            Submit
          </button>
        </div>
      </form>
    </ModalBody>
  )
}
