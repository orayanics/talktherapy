import { useState } from 'react'
import useRegisterPatientInvitation from '#/modules/register/hooks/useRegisterPatientInvitation'
import type { ModalProps } from '#/types/component'
import ModalBody from '#/components/Modal/ModalBody'
import RowError from '#/components/Table/RowError'

export default function RegisterPatientInvitation({
  isOpen,
  onClose,
}: ModalProps) {
  const [addAnother, setAddAnother] = useState(false)
  const { register, reset, onSubmit, errors, apiError, isLoading } =
    useRegisterPatientInvitation(() => {
      if (!addAnother) onClose()
    })
  const handleClose = () => {
    reset()
    setAddAnother(false)
    onClose()
  }

  return (
    <ModalBody isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={onSubmit} className="card space-y-4">
        <div className="card-body p-8">
          <h1 className="font-bold uppercase">Invite Patient</h1>
          {apiError && (
            <div className="alert alert-soft alert-error" role="alert">{apiError}</div>
          )}
          <div className="flex flex-col">
            <label htmlFor="patient-name" className="label">Name</label>
            <input
              id="patient-name"
              {...register('name')}
              placeholder="Name"
              className="input w-full"
            />
            <RowError message={errors.name?.message} />
          </div>
          <div className="flex flex-col">
            <label htmlFor="patient-email" className="label">Email</label>
            <input
              id="patient-email"
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
            <label className="label mb-3 w-fit cursor-pointer gap-2">
              <input id="patient-add-another"
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={addAnother}
                onChange={(event) => setAddAnother(event.target.checked)}
              />
              <span>Invite another after saving</span>
            </label>
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
