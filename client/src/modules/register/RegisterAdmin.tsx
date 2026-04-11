import useRegisterAdmin from './useRegisterAdmin'
import { PermissionLabels } from '@/constants/permissions'
import type { PermissionKey } from '@/constants/permissions'
import type { ModalProps } from '@/types/component'

import ModalBody from '@/components/Modal/ModalBody'
import RowError from '@/components/Table/RowError'

export default function RegisterAdmin(props: ModalProps) {
  const { isOpen, onClose } = props

  const { register, reset, onSubmit, errors, apiError, isLoading } =
    useRegisterAdmin()
  const handleClose = () => {
    reset()
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

          {/* dropdown permissions check */}
          <div>
            <label className="label">Permissions</label>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto p-2 border border-slate-300 rounded-lg">
              {Object.keys(PermissionLabels).map((key) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    className="checkbox"
                    type="checkbox"
                    value={key}
                    {...register('permissions')}
                  />
                  {PermissionLabels[key as PermissionKey]}
                </label>
              ))}
            </div>
            <RowError message={errors.permissions?.message} />
          </div>

          <div className="space-x-2">
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
