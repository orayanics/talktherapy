import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchAppointment } from '#/modules/appointments/api/appointments'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import AppointmentDetailsDrawer from '#/modules/appointments/components/AppointmentDetailsDrawer'

export const Route = createFileRoute('/_private/(shared)/appointments/$appointmentId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { appointmentId } = Route.useParams()
  const { isPending, isError } = useQuery(fetchAppointment(appointmentId))

  if (isPending) return <StateLoading />
  if (isError) return <StateError />

  return <AppointmentDetailsDrawer appointmentId={appointmentId} onClose={() => window.history.back()} />
}
