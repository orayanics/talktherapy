import useRegisterClinician from './useRegisterClinician'
import type { ModalProps } from '@/types/component'

import ModalBody from '@/components/Modal/ModalBody'
import RowError from '@/components/Table/RowError'
import { useQuery } from '@tanstack/react-query'
import { fetchDiagnoses } from '@/api/public'
import StateLoading from '@/components/State/StateLoading'
import StateError from '@/components/State/StateError'

export default function RegisterClinician(props: ModalProps) {
  const { isOpen, onClose } = props

  const { register, reset, onSubmit, errors, apiError, isLoading } =
    useRegisterClinician()
  const { data, isPending, isError } = useQuery(fetchDiagnoses)

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <ModalBody isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={onSubmit} className="card space-y-4">
        <div className="card-body p-8">
          <h1 className="font-bold uppercase">Add Clinician</h1>
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

          {isPending ? (
            <StateLoading />
          ) : isError ? (
            <StateError />
          ) : (
            <div className="flex flex-col">
              <label className="label">Diagnosis</label>
              <select className="select w-full" {...register('diagnosis_id')}>
                <option value="">Select Diagnosis</option>
                {data.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <RowError message={errors.diagnosis_id?.message} />
            </div>
          )}

          <div className="flex flex-col">
            <label className="label">Password</label>
            <input
              {...register('password')}
              placeholder="Password"
              className="input w-full"
              type="password"
            />
            <RowError message={errors.password?.message} />
          </div>

          <div className="card-footer space-x-2">
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
