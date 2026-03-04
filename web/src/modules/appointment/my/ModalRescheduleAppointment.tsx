import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import type { AvailableSlot } from '~/models/booking'
import type { ModalRescheduleAppointmentProps } from '~/models/components'
import ModalBody from '~/components/Modal/ModalBody'
import ModalHeader from '~/components/Modal/ModalHeader'
import { hasOnlyMessage } from '~/utils/errors'
import { clinicianAvailableSlotsQuery } from '~/api/scheduling'
import { formatToLocalDate, getTime } from '~/utils/date'

export default function ModalRescheduleAppointment({
  clinicianId,
  currentSlotId,
  onConfirm,
  onCancel,
  states,
}: ModalRescheduleAppointmentProps) {
  const { isLoading, errors } = states
  const [selectedSlotId, setSelectedSlotId] = useState<string>('')

  const { data: slotsData, status: slotsStatus } = useQuery(
    clinicianAvailableSlotsQuery(clinicianId),
  )
  const slots: Array<AvailableSlot> = (
    slotsStatus === 'success' ? (slotsData?.data ?? []) : []
  ).filter((s: AvailableSlot) => s.id !== currentSlotId)

  return (
    <ModalBody isOpen={true} onClose={onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (selectedSlotId) onConfirm(selectedSlotId)
        }}
      >
        {hasOnlyMessage(errors) && (
          <p className="text-error text-center text-sm mt-1">
            {errors!.message}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <ModalHeader>Reschedule Appointment</ModalHeader>

          <p className="text-sm text-gray-600">
            Select a new available slot from the same clinician. Only slots more
            than 3 days from today are eligible.
          </p>

          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {slotsStatus === 'pending' && (
              <p className="text-sm text-gray-400">Loading slots…</p>
            )}
            {slotsStatus === 'error' && (
              <p className="text-sm text-error">
                Failed to load available slots.
              </p>
            )}
            {slotsStatus === 'success' && slots.length === 0 && (
              <p className="text-sm text-gray-400">
                No other available slots found for this clinician.
              </p>
            )}
            {slots.map((slot) => {
              const date = formatToLocalDate(slot.starts_at)
              const start = getTime(slot.starts_at)
              const end = getTime(slot.ends_at)
              const isSelected = selectedSlotId === slot.id

              return (
                <label
                  key={slot.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="slot"
                    value={slot.id}
                    checked={isSelected}
                    onChange={() => setSelectedSlotId(slot.id)}
                    className="radio radio-primary radio-sm"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{date}</span>
                    <span className="text-xs text-gray-500">
                      {start} – {end}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>

          <div className="flex flex-row gap-2 justify-end pt-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!selectedSlotId || isLoading}
            >
              {isLoading ? 'Rescheduling…' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </form>
    </ModalBody>
  )
}
