import { createFileRoute } from '@tanstack/react-router'
import Grid from '~/components/Page/Grid'
import PageTitle from '~/components/Page/PageTitle'

import SoapForm from '~/modules/patients/soap/SoapForm'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId_/add',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { patientId } = Route.useParams()
  return (
    <>
      <PageTitle
        heading="Add SOAP"
        subheading="Create a new SOAP note for this patient."
      />

      <Grid cols={12} gap={6}>
        <SoapForm patientId={patientId} />
      </Grid>
    </>
  )
}
