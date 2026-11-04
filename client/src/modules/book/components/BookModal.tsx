import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import Modal from '#/components/Modal/Modal'

import { BookSlotSchema } from '../types/schema'
import type { TBookSlot } from '../types/schema'
import RowError from '#/components/Table/RowError'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TBookSlot) => Promise<void>
  apiError: string | null
  defaultValues?: Partial<TBookSlot>
}

export default function BookModal({
  isOpen,
  onClose,
  onSubmit,
  apiError,
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
    try {
      await onSubmit(data)
      onClose()
    } catch {
      return
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Slot"
      description="Pending appointments can be booked, but cannot be cancelled 1 day before the scheduled time"
      variant="info"
      submitVariant="default"
      onSubmit={submit}
      isDisabled={isSubmitting}
    >
      {apiError && (
        <div className="alert alert-error" role="alert">
          {apiError}
        </div>
      )}

      <div className="flex flex-col">
        <label htmlFor="booking-diagnosis" className="label">
          Diagnosis
        </label>
        <input
          id="booking-diagnosis"
          {...register('encounter.diagnosis')}
          className="input w-full"
        />
        <RowError message={errors.encounter?.diagnosis?.message} />
      </div>

      <div className="flex flex-col">
        <label htmlFor="booking-chief-complaint" className="label">
          Chief Complaint
        </label>
        <textarea
          id="booking-chief-complaint"
          {...register('encounter.chief_complaint')}
          className="textarea w-full"
        />
        <RowError message={errors.encounter?.chief_complaint?.message} />
      </div>

      <div className="flex flex-col">
        <label htmlFor="booking-referral-source" className="label">
          Referral Source
        </label>
        <input
          id="booking-referral-source"
          {...register('encounter.referral_source')}
          className="input w-full"
        />
        <RowError message={errors.encounter?.referral_source?.message} />
      </div>

      <div className="flex flex-col">
        <label htmlFor="booking-referral-url" className="label">
          Referral URL
        </label>
        <input
          id="booking-referral-url"
          {...register('encounter.referral_url')}
          className="input w-full"
        />
        <RowError message={errors.encounter?.referral_url?.message} />
      </div>
    </Modal>
  )
}
