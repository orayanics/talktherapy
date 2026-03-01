import { useState } from 'react'
import useBookAppointment from './useBookAppointment'
import ModalBookAppointment from './ModalBookAppointment'
import type { AvailableSlot } from '~/models/schedule'
import { getTime } from '~/utils/date'

interface AppointmentCardProps {
  data: Array<AvailableSlot>
}

export default function AppointmentCard(props: AppointmentCardProps) {
  const { data } = props
  const [current, setCurrent] = useState<string>(data[0]?.id || '')
  const {
    selectedSlot,
    form,
    errors,
    isLoading,
    isModalOpen,
    handleOpen,
    handleCancel,
    handleConfirm,
    handleFormChange,
  } = useBookAppointment()

  return (
    <>
      <div
        id="slot-list"
        className="space-y-2 min-h-[70vh] max-h-[70vh] overflow-y-auto"
      >
        {data.map((item: AvailableSlot) => {
          const { id, starts_at, ends_at, clinician } = item
          const startTime = getTime(starts_at)
          const endTime = getTime(ends_at)
          const {
            user: { name },
            diagnosis: { label },
          } = clinician

          return (
            <div
              key={id}
              className={`${current === id && 'border-primary'} collapse collapse-plus bg-base-100 border border-base-300`}
              id={`slot-${id}`}
            >
              <input
                type="radio"
                name={`accordion-${id}`}
                checked={current === id}
                onChange={() => setCurrent(id)}
              />
              <div className="collapse-title">
                <div className="flex flex-row gap-4 items-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary relative z-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpen(item)
                    }}
                  >
                    Book
                  </button>
                  <p className="badge badge-soft">{label}</p>
                  <p className="ml-auto text-sm text-gray-500">
                    {startTime} – {endTime}
                  </p>
                </div>
              </div>
              <div className="collapse-content flex flex-col gap-2 text-sm text-gray-600">
                <div>
                  <p className="font-mono text-primary">Clinician</p>
                  <p>{name}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {isModalOpen && selectedSlot && (
        <ModalBookAppointment
          slot={selectedSlot}
          form={form}
          onFormChange={handleFormChange}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          states={{ isLoading, errors }}
        />
      )}
    </>
  )
}
