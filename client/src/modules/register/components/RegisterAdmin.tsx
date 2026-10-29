import { useState } from 'react'
import useRegisterAdmin from '#/modules/register/hooks/useRegisterAdmin'
import type { ModalProps } from '#/types/component'

import ModalBody from '#/components/Modal/ModalBody'
import RowError from '#/components/Table/RowError'

export default function RegisterAdmin(props: ModalProps) {
  const { isOpen, onClose } = props
  const [addAnother, setAddAnother] = useState(false)

  const { register, reset, onSubmit, errors, apiError, isLoading } =
    useRegisterAdmin(() => {
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
          <h1 className="font-bold uppercase">Add Admin</h1>
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

          <div className="space-x-2">
            <label className="label mb-3 w-fit cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={addAnother}
                onChange={(event) => setAddAnother(event.target.checked)}
              />
              Add another after saving
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
