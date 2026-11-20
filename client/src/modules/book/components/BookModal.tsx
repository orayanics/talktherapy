import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import Modal from '#/components/Modal/Modal'

import { BookSlotSchema } from '../types/schema'
import type { TBookSlot } from '../types/schema'
import FormInput from '#/components/Form/FormInput'

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

      <FormInput
        htmlFor="booking-diagnosis"
        label="Diagnosis"
        error={errors.encounter?.diagnosis?.message}
      >
        <input
          id="booking-diagnosis"
          {...register('encounter.diagnosis')}
          className="input w-full"
        />
      </FormInput>

      <FormInput
        htmlFor="booking-chief-complaint"
        label="Chief Complaint"
        error={errors.encounter?.chief_complaint?.message}
      >
        <textarea
          id="booking-chief-complaint"
          {...register('encounter.chief_complaint')}
          className="textarea w-full"
        />
      </FormInput>

      <FormInput
        htmlFor="booking-referral-source"
        label="Referral Source"
        error={errors.encounter?.referral_source?.message}
      >
        <input
          id="booking-referral-source"
          {...register('encounter.referral_source')}
          className="input w-full"
        />
      </FormInput>

      <FormInput
        htmlFor="booking-referral-url"
        label="Referral URL"
        error={errors.encounter?.referral_url?.message}
      >
        <input
          id="booking-referral-url"
          {...register('encounter.referral_url')}
          className="input w-full"
        />
      </FormInput>
    </Modal>
  )
}
