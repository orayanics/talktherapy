import { useState } from 'react'
import useRegisterClinician from '#/modules/register/hooks/useRegisterClinician'
import type { ModalProps } from '#/types/component'

import ModalBody from '#/components/Modal/ModalBody'
import RowError from '#/components/Table/RowError'

export default function RegisterClinician(props: ModalProps) {
  const { isOpen, onClose } = props
  const [addAnother, setAddAnother] = useState(false)

  const { register, reset, onSubmit, errors, apiError, isLoading } =
    useRegisterClinician(() => {
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
          <h1 className="font-bold uppercase">Add Clinician</h1>
          {apiError && (
            <div className="alert alert-soft alert-error" role="alert">{apiError}</div>
          )}

          <div className="flex flex-col">
            <label htmlFor="clinician-name" className="label">Name</label>
            <input
              id="clinician-name"
              {...register('name')}
              placeholder="Name"
              className="input w-full"
            />
            <RowError message={errors.name?.message} />
          </div>
          <div className="flex flex-col">
            <label htmlFor="clinician-email" className="label">Email</label>
            <input
              id="clinician-email"
              {...register('email')}
              placeholder="Email"
              className="input w-full"
            />
            <RowError message={errors.email?.message} />
          </div>

          <div className="card-footer space-x-2">
            <label className="label mb-3 w-fit cursor-pointer gap-2">
              <input id="clinician-add-another"
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={addAnother}
                onChange={(event) => setAddAnother(event.target.checked)}
              />
              <span>Add another after saving</span>
            </label>
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
