import useRegisterClinician from './useRegisterClinician'
import type { ModalProps } from '@/types/component'

import ModalBody from '@/components/Modal/ModalBody'
import RowError from '@/components/Table/RowError'

export default function RegisterClinician(props: ModalProps) {
  const { isOpen, onClose } = props

  const { register, reset, onSubmit, errors, apiError, isLoading } =
    useRegisterClinician()

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <ModalBody isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={onSubmit} className="card space-y-4">
        <div className="card-body p-8">
          <h1 className="font-bold uppercase">Add Clinician</h1>
          {apiError && (
            <div className="alert alert-soft alert-error">{apiError}</div>
          )}

          <div className="flex flex-col">
            <label className="label">Email</label>
            <input
              {...register('email')}
              placeholder="Email"
              className="input w-full"
            />
            <RowError message={errors.email?.message} />
          </div>

          <div className="card-footer space-x-2">
            <button type="button" className="btn" onClick={handleClose}>
              Close
            </button>
            <button disabled={isLoading} className="btn btn-neutral">
              Add
            </button>
          </div>
        </div>
      </form>
    </ModalBody>
  )
}
