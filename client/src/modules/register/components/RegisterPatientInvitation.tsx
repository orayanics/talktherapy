import useRegisterPatientInvitation from '#/modules/register/hooks/useRegisterPatientInvitation'
import type { ModalProps } from '#/types/component'
import ModalBody from '#/components/Modal/ModalBody'
import RowError from '#/components/Table/RowError'

export default function RegisterPatientInvitation({
  isOpen,
  onClose,
}: ModalProps) {
  const { register, reset, onSubmit, errors, apiError, isLoading } =
    useRegisterPatientInvitation()
  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <ModalBody isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={onSubmit} className="card space-y-4">
        <div className="card-body p-8">
          <h1 className="font-bold uppercase">Invite Patient</h1>
          {apiError && (
            <div className="alert alert-soft alert-error">{apiError}</div>
          )}
          <div className="flex flex-col">
            <label className="label">Name</label>
            <input
              {...register('name')}
              placeholder="Name"
              className="input w-full"
            />
            <RowError message={errors.name?.message} />
          </div>
          <div className="flex flex-col">
            <label className="label">Email</label>
            <input
              {...register('email')}
              placeholder="Email"
              className="input w-full"
            />
            <RowError message={errors.email?.message} />
          </div>
          <p className="text-sm text-slate-500">
            The patient will choose a password and diagnosis during activation.
          </p>
          <div className="space-x-2">
            <button type="button" className="btn" onClick={handleClose}>
              Close
            </button>
            <button disabled={isLoading} className="btn btn-neutral">
              Invite
            </button>
          </div>
        </div>
      </form>
    </ModalBody>
  )
}
