import { fetchSoapById } from '#/modules/soaps/api/soaps'
import { createFileRoute } from '@tanstack/react-router'
import PatientRecordPage from '#/modules/soaps/components/PatientRecordPage'

export const Route = createFileRoute('/_private/(patient)/records/$soapId')({
  staticData: { crumb: 'Record details', bcLink: '.' },
  loader: ({ context, params }) =>
    context.queryClient.query(fetchSoapById(params.soapId)),
  component: PatientRecordPage,
})
