import { useState } from 'react'

import type { AvailableSlot, BookAppointmentPayload } from '~/models/schedule'
import type { ParsedError } from '~/utils/errors'
import ModalBody from '~/components/Modal/ModalBody'
import ModalHeader from '~/components/Modal/ModalHeader'
import { fieldError, hasOnlyMessage } from '~/utils/errors'
import { formatToLocalDate, getTime } from '~/utils/date'

type ReferralMode = 'link' | 'file'

interface ModalBookAppointmentProps {
  slot: AvailableSlot
  form: BookAppointmentPayload
  onFormChange: (field: keyof BookAppointmentPayload, value: string) => void
  onConfirm: () => void
  onCancel: () => void
  states: {
    isLoading: boolean
    errors: ParsedError | null
  }
}

export default function ModalBookAppointment(props: ModalBookAppointmentProps) {
  const { slot, form, onFormChange, onConfirm, onCancel, states } = props
  const { isLoading, errors } = states
  const [referralMode, setReferralMode] = useState<ReferralMode>('link')

  const {
    starts_at,
    ends_at,
    clinician: {
      user: { name },
      diagnosis: { label },
    },
  } = slot

  const date = formatToLocalDate(starts_at)
  const startTime = getTime(starts_at)
  const endTime = getTime(ends_at)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onFormChange('referral_url', reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <ModalBody isOpen={true} onClose={onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onConfirm()
        }}
      >
        {hasOnlyMessage(errors) && (
          <p className="text-error text-center text-sm mt-1">
            {errors!.message}
          </p>
        )}
        <div className="flex flex-col gap-4">
          <ModalHeader>Book Appointment</ModalHeader>

          <div className="alert alert-soft border-gray-400">
            <p className="text-sm">
              Booking this appointment,{' '}
              <span className="font-semibold">
                you will not be able to cancel or reschedule within 3 days of
                the booking date
              </span>
              . Please ensure that you are available for this appointment.
            </p>
          </div>

          {/* Appointment summary */}
          <div className="[&>div]:py-2 [&>div]:border-b [&>div]:border-gray-100 [&>div]:border-dashed text-sm">
            <div className="flex flex-row justify-between gap-2">
              <p className="font-bold">Clinician</p>
              <p>{name}</p>
            </div>
            <div className="flex flex-row justify-between gap-2">
              <p className="font-bold">Specialty</p>
              <p>{label}</p>
            </div>
            <div className="flex flex-row justify-between gap-2">
              <p className="font-bold">Date</p>
              <p>{date}</p>
            </div>
            <div className="flex flex-row justify-between gap-2">
              <p className="font-bold">Time</p>
              <p>
                {startTime} – {endTime}
              </p>
            </div>
          </div>

          {/* Patient intake fields */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Medical Diagnosis</label>
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                placeholder="e.g. Major Depressive Disorder"
                value={form.medical_diagnosis ?? ''}
                onChange={(e) =>
                  onFormChange('medical_diagnosis', e.target.value)
                }
              />
              {fieldError(errors, 'medical_diagnosis') && (
                <p className="text-error text-sm mt-1">
                  {fieldError(errors, 'medical_diagnosis')}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Source of Referral</label>
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                placeholder="e.g. Self-referred, GP, Psychiatrist"
                value={form.source_referral ?? ''}
                onChange={(e) =>
                  onFormChange('source_referral', e.target.value)
                }
              />
              {fieldError(errors, 'source_referral') && (
                <p className="text-error text-sm mt-1">
                  {fieldError(errors, 'source_referral')}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Chief Complaint</label>
              <textarea
                className="textarea textarea-bordered textarea-sm w-full resize-none"
                rows={3}
                placeholder="Briefly describe your main concern or reason for this appointment"
                value={form.chief_complaint ?? ''}
                onChange={(e) =>
                  onFormChange('chief_complaint', e.target.value)
                }
              />
              {fieldError(errors, 'chief_complaint') && (
                <p className="text-error text-sm mt-1">
                  {fieldError(errors, 'chief_complaint')}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Referral Document</label>
              <div role="tablist" className="tabs tabs-box tabs-sm mb-2">
                <button
                  type="button"
                  role="tab"
                  className={`tab ${referralMode === 'link' ? 'tab-active' : ''}`}
                  onClick={() => {
                    setReferralMode('link')
                    onFormChange('referral_url', '')
                  }}
                >
                  Link
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`tab ${referralMode === 'file' ? 'tab-active' : ''}`}
                  onClick={() => {
                    setReferralMode('file')
                    onFormChange('referral_url', '')
                  }}
                >
                  File
                </button>
              </div>

              {referralMode === 'link' ? (
                <input
                  type="url"
                  className="input input-bordered input-sm w-full"
                  placeholder="https://example.com/referral.pdf"
                  value={form.referral_url ?? ''}
                  onChange={(e) => onFormChange('referral_url', e.target.value)}
                />
              ) : (
                <input
                  type="file"
                  className="file-input file-input-bordered file-input-sm w-full"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                />
              )}

              {fieldError(errors, 'referral_url') && (
                <p className="text-error text-sm mt-1">
                  {fieldError(errors, 'referral_url')}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-row gap-2 justify-end">
            <button type="button" className="btn" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </form>
    </ModalBody>
  )
}
