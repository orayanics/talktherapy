import { fetchSoapById } from '#/modules/soaps/api/soaps'
import { createFileRoute } from '@tanstack/react-router'
import UpdateSoapPage from '#/modules/soaps/components/UpdateSoapPage'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId/soap/$soapId/update',
)({
  loader: ({ context, params }) =>
    context.queryClient.query(fetchSoapById(params.soapId)),
  component: UpdateSoapPage,
})
