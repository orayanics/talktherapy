import { useState } from 'react'
import useRegisterClinician from '#/modules/register/hooks/useRegisterClinician'
import type { ModalProps } from '#/types/component'

import Modal from '#/components/Modal/Modal'
import RowError from '#/components/Table/RowError'
import ModalHeader from '#/components/Modal/ModalHeader'
import ModalFooter from '#/components/Modal/ModalFooter'

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
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={onSubmit}>
        <ModalHeader
          title="Invite Clinicain"
          description="Clinicians can manage users and appointments, but cannot book or accept appointments."
        />

        <div className="p-8 space-y-6">
          {apiError && (
            <div className="alert alert-soft alert-error" role="alert">
              {apiError}
            </div>
          )}

          <div className="flex flex-col">
            <label htmlFor="clinician-name" className="label">
              Name
            </label>
            <input
              id="clinician-name"
              {...register('name')}
              placeholder="Name"
              className="input w-full"
            />
            <RowError message={errors.name?.message} />
          </div>
          <div className="flex flex-col">
            <label htmlFor="clinician-email" className="label">
              Email
            </label>
            <input
              id="clinician-email"
              {...register('email')}
              placeholder="Email"
              className="input w-full"
            />
            <RowError message={errors.email?.message} />
          </div>

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
