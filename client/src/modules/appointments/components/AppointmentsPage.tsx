import type { TAppointmentAction } from '#/modules/appointments/types/schema'

import { useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { formatDate } from '#/utils/useDate'

import { fetchAppointments } from '#/modules/appointments/api/appointments'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import StateNull from '#/components/State/StateNull'
import AppointmentActionModal from '#/modules/appointments/components/AppointmentActionModal'
import useAppointmentAction from '#/modules/appointments/hooks/useAppointmentAction'
import AcceptAppointmentModal from '#/modules/appointments/components/AcceptAppointmentModal'
import useAcceptAppointment from '#/modules/appointments/hooks/useAcceptAppointment'
import CompleteAppointmentModal from '#/modules/appointments/components/CompleteAppointmentModal'
import useCompleteAppointment from '#/modules/appointments/hooks/useCompleteAppointment'

import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import AppointmentDetailsDrawer from '#/modules/appointments/components/AppointmentDetailsDrawer'
import ScheduleCalendar from '#/modules/schedules/components/ScheduleCalendar'
import ScheduleData from '#/modules/dashboard/components/clinician/ScheduleData'

export default function AppointmentsPage() {
  const { role } = useAuthGuard()
  const isClinician = role === 'clinician'

  const search = useSearch({ from: '/_private/(shared)/appointments/' })

  const page = search.page ?? 1
  const from = search.from
  const sort = search.sort
  const status = search.status

  const { data, isLoading, isError } = useQuery(
    fetchAppointments({ page }, { from, sort, status }),
  )

  const {
    submit,
    reset: resetAction,
    apiError,
  } = useAppointmentAction(isClinician)
  const acceptAction = useAcceptAppointment()
  const completeAction = useCompleteAppointment()
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [openAccept, setOpenAccept] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)
  const [detailsAppointmentId, setDetailsAppointmentId] = useState<
    string | null
  >(null)

  const appointments = data?.data ?? []

  const openAction = (id: string) => {
    setSelected(id)
    setOpen(true)
  }

  const openAcceptAction = (id: string) => {
    setSelected(id)
    setOpenAccept(true)
  }

  const openCompleteAction = (id: string) => {
    setSelected(id)
    setOpenComplete(true)
  }

  const handleSubmit = async (payload: TAppointmentAction) => {
    if (!selected) return
    await submit(selected, payload)
  }

  const handleAcceptSubmit = async (payload?: { is_hidden?: boolean }) => {
    if (!selected) return
    await acceptAction.submit(selected, payload)
  }

  const handleCompleteSubmit = async (payload?: { is_hidden?: boolean }) => {
    if (!selected) return
    await completeAction.submit(selected, payload)
  }

  const closeAction = () => {
    setOpen(false)
    setSelected(null)
    resetAction()
  }

  const closeAccept = () => {
    setOpenAccept(false)
    setSelected(null)
    acceptAction.reset()
  }

  const closeComplete = () => {
    setOpenComplete(false)
    setSelected(null)
    completeAction.reset()
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <StateLoading message="Loading appointments..." />
      ) : isError ? (
        <StateError
          title="Appointments unavailable"
          message="We couldn't load the appointment list. Please try again."
        />
      ) : appointments.length === 0 ? (
        <StateNull
          title="No appointments found"
          message="No appointments match the selected filters."
        />
      ) : (
        <>
          <ScheduleCalendar
            start={from ?? formatDate(new Date(), 'yyyy-MM-dd')}
            appointments={appointments}
            isClinician={isClinician}
            onAppointmentClick={(appointment) =>
              setDetailsAppointmentId(appointment.id)
            }
            {...(isClinician && {
              onOpenAction: (appointment) => openAction(appointment.id),
              onOpenAcceptAction: (appointment) =>
                openAcceptAction(appointment.id),
              onOpenCompleteAction: (appointment) =>
                openCompleteAction(appointment.id),
            })}
            renderDay={(date) => (
              <ScheduleData
                appointments={appointments.filter(
                  (appointment) =>
                    formatDate(appointment.slot.start_at, 'yyyy-MM-dd') ===
                    date,
                )}
                onAppointmentClick={(appointment) =>
                  setDetailsAppointmentId(appointment.id)
                }
              />
            )}
          />
        </>
      )}

      <AppointmentDetailsDrawer
        appointmentId={detailsAppointmentId}
        onClose={() => setDetailsAppointmentId(null)}
      />

      <AppointmentActionModal
        isOpen={open}
        onClose={closeAction}
        onSubmit={handleSubmit}
        isClinician={isClinician}
        apiError={apiError}
      />
      <AcceptAppointmentModal
        isOpen={openAccept}
        onClose={closeAccept}
        onSubmit={handleAcceptSubmit}
        isClinician={isClinician}
        apiError={acceptAction.apiError}
      />
      <CompleteAppointmentModal
        isOpen={openComplete}
        onClose={closeComplete}
        onSubmit={handleCompleteSubmit}
        isClinician={isClinician}
        apiError={completeAction.apiError}
      />
    </div>
  )
}
