import { createFileRoute } from '@tanstack/react-router'
import { patientMyAppointmentDetailQuery } from '~/api/appointments'
import PageTitle from '~/components/Page/PageTitle'
import MyAppointmentDetail from '~/modules/appointment/my/MyAppointmentDetail'

export const Route = createFileRoute(
  '/_private/(patient)/appointments/$appointmentId',
)({
  loader: async ({ context: { queryClient }, params }) => {
    const { appointmentId } = params

    const data = await queryClient.ensureQueryData(
      patientMyAppointmentDetailQuery(appointmentId),
    )
    return data
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return (
    <>
      <PageTitle
        heading="Appointment Overview"
        subheading="Review this appointment's details."
      />
      <MyAppointmentDetail appointment={data} />
    </>
  )
}
