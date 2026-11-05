import { useState } from 'react'
import useRegisterAdmin from '#/modules/register/hooks/useRegisterAdmin'
import type { ModalProps } from '#/types/component'

import Modal from '#/components/Modal/Modal'
import FormInput from '#/components/Form/FormInput'

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Admin"
      description="Admins can manage users and appointments, but cannot book or accept appointments."
      onSubmit={onSubmit}
      isDisabled={isLoading}
    >
      {apiError && (
        <div className="alert alert-soft alert-error" role="alert">
          {apiError}
        </div>
      )}

      <FormInput label="Name" error={errors.name?.message} required>
        <input
          id="admin-name"
          {...register('name')}
          placeholder="Name"
          className="input w-full"
        />
      </FormInput>

      <FormInput label="Email" error={errors.email?.message} required>
        <input
          id="admin-email"
          {...register('email')}
          placeholder="Email"
          className="input w-full"
        />
      </FormInput>

      <label className="label mb-3 w-fit cursor-pointer gap-2">
        <input
          id="admin-add-another"
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={addAnother}
          onChange={(event) => setAddAnother(event.target.checked)}
        />
        <span>Add another after saving</span>
      </label>

      <div className="space-x-2"></div>
    </Modal>
  )
}
