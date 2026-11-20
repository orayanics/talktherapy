import { useState } from 'react'
import useRegisterClinician from '#/modules/register/hooks/useRegisterClinician'
import type { ModalProps } from '#/types/component'

import Modal from '#/components/Modal/Modal'
import FormInput from '#/components/Form/FormInput'

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Clinicain"
      description="Clinicians can manage users and appointments, but cannot book or accept appointments."
      onSubmit={onSubmit}
      isDisabled={isLoading}
    >
      {apiError && (
        <div className="alert alert-soft alert-error" role="alert">
          {apiError}
        </div>
      )}

      <FormInput
        htmlFor="clinician-name"
        label="Name"
        error={errors.name?.message}
        required
      >
        <input
          id="clinician-name"
          {...register('name')}
          placeholder="Name"
          className="input w-full"
        />
      </FormInput>
      <FormInput
        htmlFor="clinician-email"
        label="Email"
        error={errors.email?.message}
        required
      >
        <input
          id="clinician-email"
          {...register('email')}
          placeholder="Email"
          className="input w-full"
        />
      </FormInput>

      <label className="label mb-3 w-fit cursor-pointer gap-2">
        <input
          id="clinician-add-another"
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={addAnother}
          onChange={(event) => setAddAnother(event.target.checked)}
        />
        <span>Add another after saving</span>
      </label>
    </Modal>
  )
}
