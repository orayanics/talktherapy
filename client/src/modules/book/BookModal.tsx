import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import ModalBody from '@/components/Modal/ModalBody'

import { BookSlotSchema } from './schema'
import type { TBookSlot } from './schema'
import RowError from '@/components/Table/RowError'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TBookSlot) => Promise<void>
  defaultValues?: Partial<TBookSlot>
}

export default function BookModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TBookSlot>({
    resolver: zodResolver(BookSlotSchema),
    defaultValues: {
      encounter: {
        diagnosis: '',
        chief_complaint: '',
        referral_source: '',
        referral_url: '',
      },
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  const submit = handleSubmit(async (data) => {
    await onSubmit(data)
    onClose()
  })

  return (
    <ModalBody isOpen={isOpen} onClose={onClose}>
      <form onSubmit={submit} className="card space-y-4">
        <div className="card-body p-8 space-y-3">
          <h1 className="font-bold uppercase">Book Slot</h1>

          <div className="alert alert-soft flex flex-col text-center">
            <p>
              You <b>cannot cancel an appointment 1 day before</b> the scheduled
              time.
            </p>
          </div>

          <div className="flex flex-col">
            <label className="label">Diagnosis</label>
            <input
              {...register('encounter.diagnosis')}
              className="input w-full"
            />
            <RowError message={errors.encounter?.diagnosis?.message} />
          </div>

          <div className="flex flex-col">
            <label className="label">Chief Complaint</label>
            <textarea
              {...register('encounter.chief_complaint')}
              className="textarea w-full"
            />
            <RowError message={errors.encounter?.chief_complaint?.message} />
          </div>

          <div className="flex flex-col">
            <label className="label">Referral Source</label>
            <input
              {...register('encounter.referral_source')}
              className="input w-full"
            />
            <RowError message={errors.encounter?.referral_source?.message} />
          </div>

          <div className="flex flex-col">
            <label className="label">Referral URL</label>
            <input
              {...register('encounter.referral_url')}
              className="input w-full"
            />
            <RowError message={errors.encounter?.referral_url?.message} />
          </div>

          <div className="card-footer space-x-2">
            <button type="button" className="btn" onClick={onClose}>
              Close
            </button>
            <button disabled={isSubmitting} className="btn btn-neutral">
              Book
            </button>
          </div>
        </div>
      </form>
    </ModalBody>
  )
}
