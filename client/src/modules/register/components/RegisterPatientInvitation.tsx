import { useState } from 'react'
import useRegisterPatientInvitation from '#/modules/register/hooks/useRegisterPatientInvitation'
import type { ModalProps } from '#/types/component'

import Modal from '#/components/Modal/Modal'
import FormInput from '#/components/Form/FormInput'

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Patient"
      description="Patients can manage users and appointments, but cannot book or accept appointments."
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
          id="patient-name"
          {...register('name')}
          placeholder="Name"
          className="input w-full"
        />
      </FormInput>
      <FormInput label="Email" error={errors.email?.message} required>
        <input
          id="patient-email"
          {...register('email')}
          placeholder="Email"
          className="input w-full"
        />
      </FormInput>
      <p className="text-sm text-slate-500">
        The patient will choose a password and diagnosis during activation
      </p>

      <label className="label mb-3 w-fit cursor-pointer gap-2">
        <input
          id="patient-add-another"
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={addAnother}
          onChange={(event) => setAddAnother(event.target.checked)}
        />
        <span>Invite another after saving</span>
      </label>
    </Modal>
  )
}
