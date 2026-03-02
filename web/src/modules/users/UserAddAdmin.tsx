import { useRegisterAdmin } from './useUserAdd'
import type { PermissionKey } from '~/models/user/permissions'
import type { UserAddAdminProps } from '~/models/components'
import ModalHeader from '~/components/Modal/ModalHeader'
import ModalBody from '~/components/Modal/ModalBody'
import { PermissionLabels } from '~/models/user/permissions'
import { fieldError, hasOnlyMessage } from '~/utils/errors'

export default function UserAddAdmin(props: UserAddAdminProps) {
  const { isOpen, onClose } = props
  const {
    form,
    handleChange,
    handlePermissionChange,
    handleSubmit,
    resetState,
    errors,
    isLoading,
  } = useRegisterAdmin()

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
          <ModalHeader>Add Admin User</ModalHeader>
          <div>
            <label className="input w-full">
              <span className="label">Email</span>
              <input
                type="email"
                placeholder="email@email.com"
                name="email"
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

          <div>
            {/* Permission Checklist */}
            <span className="label">Permissions</span>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto p-2 border rounded">
              {Object.keys(PermissionLabels).map((key) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="abilities"
                    value={key}
                    checked={form.abilities.includes(key as PermissionKey)}
                    onChange={handlePermissionChange}
                  />
                  {PermissionLabels[key as PermissionKey]}
                </label>
              ))}
            </div>
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
            aria-busy={isLoading}
          >
            Submit
          </button>
        </div>
      </form>
    </ModalBody>
  )
}
