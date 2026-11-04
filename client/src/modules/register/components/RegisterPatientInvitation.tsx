import { useState } from 'react'
import useRegisterPatientInvitation from '#/modules/register/hooks/useRegisterPatientInvitation'
import type { ModalProps } from '#/types/component'

import Modal from '#/components/Modal/Modal'
import RowError from '#/components/Table/RowError'
import ModalHeader from '#/components/Modal/ModalHeader'
import ModalFooter from '#/components/Modal/ModalFooter'

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
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={onSubmit}>
        <ModalHeader
          title="Invite Patient"
          description="Patients can manage users and appointments, but cannot book or accept appointments."
        />

        <div className="p-8 space-y-6">
          {apiError && (
            <div className="alert alert-soft alert-error" role="alert">
              {apiError}
            </div>
          )}
          <div className="flex flex-col">
            <label htmlFor="patient-name" className="label">
              Name
            </label>
            <input
              id="patient-name"
              {...register('name')}
              placeholder="Name"
              className="input w-full"
            />
            <RowError message={errors.name?.message} />
          </div>
          <div className="flex flex-col">
            <label htmlFor="patient-email" className="label">
              Email
            </label>
            <input
              id="patient-email"
              {...register('email')}
              placeholder="Email"
              className="input w-full"
            />
            <RowError message={errors.email?.message} />
          </div>
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
        </div>
      </form>

      <ModalFooter
        onClose={handleClose}
        onSubmit={onSubmit}
        isDisabled={isLoading}
      />
    </Modal>
  )
}
